function datediff(first, second) {        
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

export { datediff}