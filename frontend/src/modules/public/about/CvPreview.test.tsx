import { act, fireEvent, screen, within } from '@testing-library/react'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterEach, expect, it, vi } from 'vitest'
import { site } from '../../../shared/site'
import { texts } from '../../../shared/texts'
import { renderRoute } from '../../../test/render'

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')

afterEach(() => {
  window.history.replaceState(null, '', '/')
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor)
  else Reflect.deleteProperty(navigator, 'clipboard')
  vi.useRealTimers()
})

async function openCv() {
  renderRoute('/about')
  fireEvent.click(await screen.findByRole('button', { name: 'View my CV' }))
  return screen.getByRole('dialog', { name: 'Curriculum vitae' })
}

it('opens the CV dialog from the About button', async () => {
  expect(await openCv()).toHaveAttribute('open')
})

it('renders the seven sections from static CV content', async () => {
  const element = await openCv()
  const dialog = within(element)
  const headings = [
    'Professional summary',
    'Skills',
    'Professional experience',
    'Volunteer experience',
    'Education',
    'Certifications',
    'Languages',
  ]
  expect(dialog.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(headings)
  const volunteer = dialog.getByRole('heading', { name: 'Volunteer experience' }).closest('section')!
  expect(within(volunteer).getByText('IT Manager')).toBeInTheDocument()
  const certifications = dialog.getByRole('heading', { name: 'Certifications' }).closest('section')!
  expect(within(certifications).getByText('CompTIA Security+ (2022)')).toBeInTheDocument()
  expect(dialog.getAllByRole('link').some((link) => link.getAttribute('href')?.startsWith('mailto:'))).toBe(false)
  const linkedin = dialog.getByRole('link', { name: 'linkedin.com/in/yintong-zhou' })
  expect(linkedin).toHaveAttribute('href', site.linkedinUrl)
  expect(linkedin).toHaveAttribute('target', '_blank')
  expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer')
  expect(dialog.getAllByRole('link').some((link) => link.getAttribute('href') === site.githubUrl)).toBe(false)
  expect(element).not.toHaveTextContent('github.com')
})

it('separates entry titles, organizations and dates without vertical bars', async () => {
  const element = await openCv()
  const dialog = within(element)
  expect(element.textContent).not.toContain(' | ')
  expect(dialog.getByText('Software Developer')).toBeInTheDocument()
  expect(dialog.getByText('Sirti S.p.A., Milan, Italy')).toBeInTheDocument()
  expect(dialog.getByText('05/2023 - Present')).toBeInTheDocument()
})

it('copies the email and announces success for two seconds', async () => {
  const dialog = within(await openCv())
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  vi.useFakeTimers()
  const button = dialog.getByRole('button', { name: `Copy email address ${site.email}` })
  const feedback = button.parentElement!.querySelector('[aria-live="polite"]')!
  expect(feedback).toBeEmptyDOMElement()
  await act(async () => fireEvent.click(button))
  expect(writeText).toHaveBeenCalledWith(site.email)
  expect(feedback).toHaveTextContent('Copied')
  act(() => vi.advanceTimersByTime(1999))
  expect(feedback).toHaveTextContent('Copied')
  act(() => vi.advanceTimersByTime(1))
  expect(feedback).toBeEmptyDOMElement()
})

it.each(['unavailable', 'rejected'])('keeps clipboard failure silent when %s', async (failure) => {
  const dialog = within(await openCv())
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: failure === 'unavailable' ? undefined : { writeText: vi.fn().mockRejectedValue(new Error('Denied')) },
  })
  await act(async () => fireEvent.click(dialog.getByRole('button', { name: `Copy email address ${site.email}` })))
  expect(dialog.queryByText('Copied')).not.toBeInTheDocument()
})

it('clears the copy feedback timer when the sheet unmounts', async () => {
  const dialog = await openCv()
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
  vi.useFakeTimers()
  await act(async () =>
    fireEvent.click(within(dialog).getByRole('button', { name: `Copy email address ${site.email}` })),
  )
  expect(within(dialog).getByText('Copied')).toBeInTheDocument()
  const timers = vi.getTimerCount()
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
  expect(vi.getTimerCount()).toBeLessThan(timers)
})

it('downloads the CV PDF without opening the print dialog', async () => {
  const dialog = await openCv()
  const print = vi.spyOn(window, 'print').mockImplementation(() => {})
  const link = within(dialog).getByRole('link', { name: 'Download CV (PDF)' })
  expect(link).toHaveAttribute('href', site.cvPdfUrl)
  expect(link).toHaveAttribute('download', 'Yintong_Zhou_CV.pdf')
  link.addEventListener('click', (event) => event.preventDefault())
  fireEvent.click(link)
  expect(print).not.toHaveBeenCalled()
})

it('includes the static CV PDF file', () => {
  const pdfPath = '../../../../public/cv/Yintong_Zhou_CV.pdf'
  expect(existsSync(fileURLToPath(new URL(pdfPath, import.meta.url)))).toBe(true)
})

it('closes with the close button', async () => {
  const dialog = await openCv()
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
  expect(dialog).not.toHaveAttribute('open')
  expect(screen.queryByRole('dialog')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'View my CV' }))
  expect(dialog).toHaveAttribute('open')
  expect(within(dialog).getByRole('heading', { name: texts.cv.sheet.headings.summary })).toBeInTheDocument()
})

it('closes only when the dialog backdrop itself is clicked', async () => {
  const dialog = await openCv()
  fireEvent.click(within(dialog).getByRole('heading', { name: 'Curriculum vitae' }))
  expect(dialog).toHaveAttribute('open')
  fireEvent.click(dialog)
  expect(dialog).not.toHaveAttribute('open')
})

it('opens from #cv and removes only that hash on native close', async () => {
  window.history.replaceState({ source: 'cv' }, '', '/about?source=home#cv')
  renderRoute('/about')
  const dialog = await screen.findByRole('dialog', { name: 'Curriculum vitae' })
  fireEvent(dialog, new Event('close'))
  expect(window.location.pathname + window.location.search + window.location.hash).toBe('/about?source=home')
  expect(window.history.state).toEqual({ source: 'cv' })
})
