import type { CSSProperties } from "react";

/**
 * Permissions the third-party player needs. `fullscreen` in particular is easy
 * to get wrong: a cross-origin document only inherits it when the iframe's
 * `allow` attribute is in place before the element is inserted into the page.
 */
export const PLAYER_ALLOW = "autoplay; fullscreen; encrypted-media; picture-in-picture";

interface Props {
  src: string;
  title: string;
  className?: string;
  style?: CSSProperties;
  onLoad?: () => void;
}

/**
 * Cross-origin player iframe.
 *
 * Keep `allow` on the element before it is inserted: browsers capture the
 * frame's permission policy at insertion, and a later change does not re-grant
 * permissions to the document that is already loading. React assigns props
 * before appending, so having it here is enough.
 */
export default function PlayerIframe({ src, title, className, style, onLoad }: Props) {
  return (
    <iframe
      allow={PLAYER_ALLOW}
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      title={title}
      loading="eager"
      className={className}
      style={style}
      src={src}
      onLoad={onLoad}
    />
  );
}
