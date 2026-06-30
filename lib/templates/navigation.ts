export function getTemplatesHref(isSignedIn: boolean | undefined): string {
  return isSignedIn ? "/templates" : "/sign-in";
}
