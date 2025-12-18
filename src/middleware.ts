import { NextRequest, NextResponse } from "next/server";

const PUBLIC_EXACT = new Set<string>(["/", "/cadastro", "/recuperar-senha"]);
const PUBLIC_PREFIXES = ["/recuperar-senha"];

const normalize = (p: string) => (p !== "/" ? p.replace(/\/+$/, "") : "/");

function isPublic(pathname: string) {
    const path = normalize(pathname);
    if (PUBLIC_EXACT.has(path)) return true;
    return PUBLIC_PREFIXES.some(
        (prefix) => path === prefix || path.startsWith(prefix + "/")
    );
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAuthenticated = !!request.cookies.get("auth_token");

    if (pathname.startsWith("/confirmar-email/")) {
        return NextResponse.next();
    }

    if (!isAuthenticated && !isPublic(pathname)) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (isAuthenticated && isPublic(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
