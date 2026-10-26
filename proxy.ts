import {NextRequest,NextResponse} from 'next/server';
const canonicalHost='spaceops-keay333-7201.vercel.app';
export function proxy(req:NextRequest){
 // Start browser navigation on the same origin used by the email provider.
 // The PKCE verifier and recovery intent cookies must remain on that origin.
 if((req.method==='GET'||req.method==='HEAD')&&req.nextUrl.hostname==='spaceops-alpha.vercel.app'){
  const target=req.nextUrl.clone();target.hostname=canonicalHost;target.protocol='https:';target.port='';
  const response=NextResponse.redirect(target,307);response.headers.set('Cache-Control','no-store');return response;
 }
 if(req.nextUrl.pathname.startsWith('/api/')&&req.method!=='GET'&&req.method!=='HEAD'&&req.headers.get('origin')!==req.nextUrl.origin)return new NextResponse(null,{status:403});
 return NextResponse.next();
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.svg).*)']};
