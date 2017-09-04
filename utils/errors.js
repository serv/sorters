export const errorMessage = (e) => {
    if (e.graphQLErrors && e.graphQLErrors.length > 0) {
        return e.graphQLErrors[0].message
    } else {
        return e.message
    }
}