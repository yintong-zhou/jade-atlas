const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 font-medium transition-[filter,background,box-shadow] duration-(--motion-fast) motion-reduce:transition-none'

const variants = {
  main: 'glass-main',
  secondary: 'glass-secondary',
}

export type ButtonVariant = keyof typeof variants

export const buttonClass = (variant: ButtonVariant) => `${base} ${variants[variant]}`
