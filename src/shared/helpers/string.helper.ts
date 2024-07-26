export function maskString(text: string) {
  const [username, domain] = text.split('@');
  const maskedUsername =
    username.charAt(0) + '****' + username.charAt(username.length - 1);
  return maskedUsername + '@' + domain;
}

export function stringToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
