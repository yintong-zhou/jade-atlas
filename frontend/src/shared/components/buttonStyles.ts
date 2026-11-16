const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 font-medium transition-[translate,scale,filter,background,box-shadow] duration-(--motion-fast) ease-out hover:-translate-y-px hover:brightness-[1.03] active:scale-[0.98] motion-reduce:translate-none motion-reduce:scale-none motion-reduce:transition-none'

const variants = {
  main: 'glass-main',
  secondary: 'glass-secondary',
}

export type ButtonVariant = keyof typeof variants

export const buttonClass = (variant: ButtonVariant, size?: 'xl') =>
  `${base} ${variants[variant]}${size === 'xl' ? ' type-h3 h-[72px] w-full sm:h-24' : ''}`
