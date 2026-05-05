// Skeleton: Demo file (JSX, lives at src/demo/<Category>/<Name>Demo.jsx)
// Modeled on: src/demo/Backgrounds/AuroraDemo.jsx
//
// The demo file is shared across all four variants — it always imports from src/content/
// (the JS-CSS variant). The docs site's variant switcher swaps which source the user copies,
// but the live preview is rendered from one variant.

import { useMemo } from 'react';
import { CodeTab, PreviewTab, TabsLayout } from '../../components/common/TabsLayout';
import { Box } from '@chakra-ui/react';

import CodeExample from '../../components/code/CodeExample';
import PropTable from '../../components/common/Preview/PropTable';
import Dependencies from '../../components/code/Dependencies';
import useForceRerender from '../../hooks/useForceRerender';
import useComponentProps from '../../hooks/useComponentProps';
import Customize from '../../components/common/Preview/Customize';
import PreviewSlider from '../../components/common/Preview/PreviewSlider';
import PreviewColorPickerCustom from '../../components/common/Preview/PreviewColorPickerCustom';
import { ComponentPropsProvider } from '../../components/context/ComponentPropsContext';

// Always import from src/content/ (JS-CSS variant) for the live preview.
import MyComponent from '../../content/<Category>/<Name>/<Name>';
import { myComponent } from '../../constants/code/<Category>/<nameLower>Code';

// Default values match the component's defaults so a fresh viewer sees the canonical look.
const DEFAULT_PROPS = {
  color: '#7c3aed',
  speed: 1,
  blend: 0.5,
};

const MyComponentDemo = () => {
  const { props, updateProp, resetProps, hasChanges } = useComponentProps(DEFAULT_PROPS);
  const { color, speed, blend } = props;

  // Force a remount of the component when needed (useful for shader components that
  // do all their setup in useEffect — re-running the effect re-applies new uniforms).
  const [key, forceRerender] = useForceRerender();

  const propData = useMemo(
    () => [
      {
        name: 'color',
        type: 'string',
        default: "'#7c3aed'",
        description: 'Primary hex color driving the shader uniform.',
      },
      {
        name: 'speed',
        type: 'number',
        default: '1',
        description: 'Animation speed multiplier.',
      },
      {
        name: 'blend',
        type: 'number',
        default: '0.5',
        description: 'Soft-edge blend factor (0..1).',
      },
    ],
    [],
  );

  return (
    <ComponentPropsProvider
      props={props}
      defaultProps={DEFAULT_PROPS}
      resetProps={resetProps}
      hasChanges={hasChanges}
    >
      <TabsLayout>
        <PreviewTab>
          <Box position="relative" className="demo-container" h={500} p={0} overflow="hidden">
            <MyComponent key={key} color={color} speed={speed} blend={blend} />
          </Box>

          <Customize>
            <PreviewColorPickerCustom
              title="Color"
              color={color}
              onChange={val => {
                updateProp('color', val);
                forceRerender();
              }}
            />
            <PreviewSlider
              title="Speed"
              min={0}
              max={2}
              step={0.1}
              value={speed}
              onChange={val => {
                updateProp('speed', val);
                forceRerender();
              }}
            />
            <PreviewSlider
              title="Blend"
              min={0}
              max={1}
              step={0.01}
              value={blend}
              onChange={val => {
                updateProp('blend', val);
                forceRerender();
              }}
            />
          </Customize>

          <PropTable data={propData} />
          {/* List only the runtime deps the component actually imports. */}
          <Dependencies dependencyList={['ogl']} />
        </PreviewTab>

        <CodeTab>
          <CodeExample codeObject={myComponent} componentName="MyComponent" />
        </CodeTab>
      </TabsLayout>
    </ComponentPropsProvider>
  );
};

export default MyComponentDemo;
