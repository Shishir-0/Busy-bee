export function getParam(val) {
    if (Array.isArray(val))
        return val[0] || '';
    return val || '';
}
//# sourceMappingURL=params.js.map