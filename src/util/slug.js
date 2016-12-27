/**
 * Extract the unique ID from a human readable slug to locate the resource.
 * @param  {String} slug - human-readable slug; see `humanSlugForResource`
 * @return {String}
 */
export function normalizeUrlSlug(slug) {
    return slug.split('-').reverse()[0];
}

/**
 * Clean up a phrase for using in the URL.
 * @param  {String} phrase - words to sanitize
 * @param  {Number} [length=10] - number of characters to include in result
 * @return {String}
 */
function sanitizeUrlPhrase(phrase, length=40) {
    return phrase
        .toLowerCase()
        .replace(/\<.*\>/g, '')
        .replace(/[^\s\w\d\-_]/g, '')
        .replace(/\s+/g, '-')
        .substr(0, length);
}

/**
 * Generate a human-readable slug given a resource title and ID. The ID will be
 * recoverable from this slug, but people will be able to recognize what the
 * content at this URL will be.
 * @param  {String} id - Unique ID of resource
 * @param  {String} title - Arbitrary resource title
 * @return {String}
 */
export function humanSlugForResource(id, title) {
    if (!title) {
        return id;
    }
    return `${sanitizeUrlPhrase(title)}-${id}`;
}
