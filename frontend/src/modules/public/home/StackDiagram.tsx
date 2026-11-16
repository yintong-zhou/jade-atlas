import { useEffect, useRef } from 'react'
import dotnet from '../../../assets/icons/dotnet.svg'
import google from '../../../assets/icons/google-icon.svg'
import javascript from '../../../assets/icons/javascript.svg'
import oracle from '../../../assets/icons/oracle.svg'
import salesforce from '../../../assets/icons/salesforce.svg'
import { texts } from '../../../shared/texts'
import styles from './StackDiagram.module.css'

export function StackDiagram() {
  const figureRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const figure = figureRef.current
    if (!figure || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      figure.dataset.inView = String(entry.isIntersecting)
    })
    observer.observe(figure)
    return () => observer.disconnect()
  }, [])

  return (
    <figure
      ref={figureRef}
      aria-label={texts.home.stack.summary}
      className={`${styles.diagram} rounded-lg bg-muted p-6 sm:p-12`}
    >
      <div className={`${styles.node} rounded-md bg-card p-4`}>
        <img src={javascript} alt="" width={24} height={24} />
        <div>
          <p className="type-h3">{texts.home.stack.frontEnd.label}</p>
          <p className="type-body mt-2 text-muted-foreground">{texts.home.stack.frontEnd.detail}</p>
        </div>
      </div>
      <div className={`${styles.backend} rounded-md bg-card p-6 ring-1 ring-accent`}>
        <span className={styles.connection} aria-hidden="true" />
        <div className={styles.node}>
          <img src={dotnet} alt="" width={28} height={28} />
          <div>
            <p className="type-h3">{texts.home.stack.backend.label}</p>
            <p className="type-body mt-2 text-muted-foreground">{texts.home.stack.backend.detail}</p>
          </div>
        </div>
        <span className={`${styles.connection} ${styles.output}`} aria-hidden="true" />
      </div>
      <div className={styles.destinations}>
        <h3 className={`${styles.groupTitle} type-label pb-2 text-muted-foreground`}>
          <span className={styles.connection} aria-hidden="true" />
          {texts.home.stack.data.label}
        </h3>
        <ul className={styles.tools}>
          {texts.home.stack.data.items.map((name, index) => (
            <li key={name} className={`${styles.target} ${index === 0 ? styles.firstTarget : ''}`}>
              <span className={styles.branch} aria-hidden="true">
                <span className={styles.connection} />
              </span>
              <div className={`${styles.tool} rounded-md bg-card p-4`}>
                {index === 0 && <img src={oracle} alt="" width={92} height={12} className={styles.oracle} />}
                <span className="type-body">{name}</span>
              </div>
            </li>
          ))}
        </ul>
        <h3 className={`${styles.servicesTitle} type-label text-muted-foreground`}>
          <span className={styles.connection} aria-hidden="true" />
          <span className={styles.trunk} aria-hidden="true" />
          {texts.home.stack.services.label}
        </h3>
        <ul className={styles.tools}>
          {texts.home.stack.services.items.map((name, index) => (
            <li key={name} className={`${styles.target} ${index === 2 ? styles.lastTarget : ''}`}>
              <span className={styles.branch} aria-hidden="true">
                <span className={styles.connection} />
              </span>
              <div className={`${styles.tool} rounded-md bg-card p-4`}>
                {index === 0 && <img src={salesforce} alt="" width={36} height={24} />}
                {index === 2 && <img src={google} alt="" width={24} height={24} />}
                <span className="type-body">{name}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}
