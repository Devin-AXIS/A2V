import { NextResponse, type NextRequest } from "next/server"
import { match as matchLocale } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"
import { i18n } from "@/lib/dictionaries"

function getLocale(request: NextRequest): string {
  // 1. Check cookie for user's preferred locale
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value
  if (localeCookie && i18n.locales.includes(localeCookie as any)) {
    return localeCookie
  }

  // 2. Check the 'Accept-Language' header
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  let languages: string[] | undefined
  try {
    languages = new Negotiator({ headers: negotiatorHeaders }).languages()
  } catch (error) {
    console.error("Error parsing Accept-Language header:", error)
    return i18n.defaultLocale
  }

  try {
    return matchLocale(languages, i18n.locales, i18n.defaultLocale)
  } catch (e) {
    return i18n.defaultLocale
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the path is for a static file, API route, or image, and ignore it.
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || /\.(.*)$/.test(pathname)) {
    return NextResponse.next()
  }

  // Check if the path is for PC routes
  if (pathname.startsWith("/pc")) {
    const pathnameIsMissingLocale = i18n.locales.every(
      (locale) => !pathname.startsWith(`/pc/${locale}/`) && pathname !== `/pc/${locale}`,
    )
    if (pathnameIsMissingLocale) {
      const locale = getLocale(request)
      return NextResponse.redirect(new URL(`/pc/${locale}${pathname.substring(3) || "/"}`, request.url))
    }
  } else {
    // Check for mobile/default routes
    const pathnameIsMissingLocale = i18n.locales.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    )
    if (pathnameIsMissingLocale) {
      const locale = getLocale(request)
      return NextResponse.redirect(new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
