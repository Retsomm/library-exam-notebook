import {brand} from '../lib/brand.mjs';
type Props={variant?:'lockup'|'mark';className?:string};
export default function BrandLogo({variant='lockup',className=''}:Props){
 return <span className={`site-logo site-logo-${variant==='mark'?'icon-only':variant} ${className}`.trim()} role="img" aria-label={`${brand.name} ${brand.english}`}>
  <img className="site-logo-mark" src={brand.logo} width={64} height={64} alt="" aria-hidden="true"/>
  {variant==='lockup'&&<span className="site-logo-wordmark" aria-hidden="true"><strong>{brand.name}</strong><small>{brand.english}</small></span>}
 </span>;
}
