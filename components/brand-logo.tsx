type Props={variant?:'lockup'|'mark';className?:string};
export default function BrandLogo({variant='lockup',className=''}:Props){
 return <span className={`site-logo site-logo-${variant} ${className}`.trim()} role="img" aria-label="閱日 DAILY LIBRARY STUDY">
  <img className="site-logo-mark" src="/brand/sunrise-mark.svg" width={64} height={64} alt="" aria-hidden="true"/>
  {variant==='lockup'&&<span className="site-logo-wordmark" aria-hidden="true"><strong>閱日</strong><small>DAILY LIBRARY STUDY</small></span>}
 </span>;
}
