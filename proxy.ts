import {NextRequest,NextResponse} from 'next/server';
export function proxy(req:NextRequest){if(req.method!=='GET'&&req.method!=='HEAD'&&req.headers.get('origin')!==req.nextUrl.origin)return new NextResponse(null,{status:403});return NextResponse.next();}
export const config={matcher:['/api/:path*']};
