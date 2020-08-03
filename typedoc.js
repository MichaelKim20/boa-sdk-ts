const excludeFiles = [
    'index.d'
];

module.exports = {
    out: './docs/',
    readme: './README.MD',
    includes: './src',
    exclude: [
        '**/__dist__/**/*',
        '**/__lib__/**/*',
        '**/__tests__/**/*',
        '**/node_modules/**/*',
        ...excludeFiles.map(f => `./src/${f}.ts`)
    ],
    mode: 'file',
    excludeExternals: true,
    excludePrivate: true,
    includeDeclarations: true,
    stripInternal: true,
    hideGenerator: true,
    theme: 'minimal'
};
