const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-6 font-medium transition-[color,background-color,border-color] duration-(--motion-fast)'

const variants = {
  main: 'bg-accent text-on-accent',
  secondary: 'border border-primary text-foreground hover:bg-muted',
}

export type ButtonVariant = keyof typeof variants

export const buttonClass = (variant: ButtonVariant) => `${base} ${variants[variant]}`
