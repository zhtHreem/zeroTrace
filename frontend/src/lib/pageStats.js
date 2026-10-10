// Anonymous, cookie-free page-view counts.
//
// ZeroTrace promises that nothing ties a person to a survey, so this deliberately counts
// less than it could:
//  - survey-answering pages (/form/...) are never counted, so a visit can't be associated
//    with taking a particular survey
//  - profile pages (/user/...) are never counted, because their URLs contain an account id
//  - query strings and fragments are dropped before anything leaves the browser
const NEVER_COUNT = [/^\/form(\/|$)/, /^\/user(\/|$)/];

export function beforeSend(event) {
  try {
    const url = new URL(event.url);
    if (NEVER_COUNT.some((rule) => rule.test(url.pathname))) return null;
    url.search = '';
    url.hash = '';
    return { ...event, url: url.toString() };
  } catch (e) {
    return null; // if in doubt, don't send
  }
}
