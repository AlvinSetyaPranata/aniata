import { useState } from 'react'

export default function SkeletonImage({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  ...rest
}) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={`relative overflow-hidden bg-[linear-gradient(160deg,#e9e6df_0%,#dcd8ce_100%)] ${className}`}
    >
      {!loaded && !failed && (
        <div className="skeleton-shimmer absolute inset-0" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        className={`block h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        {...rest}
      />
    </div>
  )
}
