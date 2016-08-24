
export default function retrieveCsrfToken() {
  const metaTags = document.head.getElementsByTagName('meta');

  for (let i=0; i<metaTags.length; i+=1) {
    let metaTag = metaTags[i];
    if (metaTag.getAttribute('name') === 'csrf-token') {
      if (metaTag.hasAttribute('content')) {
        return metaTag.getAttribute('content');
      }
    }
  }
}
