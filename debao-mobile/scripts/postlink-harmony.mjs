import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const factoryPath = resolve(
  'harmony/entry/src/main/ets/RNOHPackagesFactory.ets',
);

let source = readFileSync(factoryPath, 'utf8');
const legacyNamedExports = [
  ['AsyncStoragePackage', '@react-native-oh-tpl/async-storage'],
  ['SafeAreaViewPackage', '@react-native-oh-tpl/react-native-safe-area-context'],
  ['SvgPackage', '@react-native-oh-tpl/react-native-svg'],
];

for (const [className, packageName] of legacyNamedExports) {
  source = source.replace(
    `import ${className} from '${packageName}';`,
    `import { ${className} } from '${packageName}';`,
  );
}

writeFileSync(factoryPath, source, 'utf8');
