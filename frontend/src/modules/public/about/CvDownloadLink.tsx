import { Download } from 'lucide-react'
import { buttonClass } from '../../../shared/components/buttonStyles'
import { texts } from '../../../shared/texts'

export function CvDownloadLink({ url }: { url: string | null }) {
  if (!url) return null
  return (
    <a href={url} download className={buttonClass('secondary')}>
      <Download size={20} strokeWidth={1.5} aria-hidden="true" />
      {texts.cv.download}
    </a>
  )
}
