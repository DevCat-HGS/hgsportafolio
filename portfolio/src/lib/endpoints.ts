/**
 * The contact form posts to the admin site, which sends the emails (admin/netlify/functions/contact.mts). Shared by
 * the form and by the security policy, which must allow connecting to it.
 */
export const CONTACT_ORIGIN = "https://admin.hgsportafolio.site";
export const CONTACT_API = `${CONTACT_ORIGIN}/api/contact`;
