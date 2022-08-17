import { TreemapPoint } from 'react-vis';

interface TreemapHintProps {
  className?: string;
  treemapPoint: TreemapPoint;
}

export const TreemapHint = ({
  treemapPoint,
}: TreemapHintProps): JSX.Element | null => {
  return (
    <div
      className="relative z-10 p-3 text-xs text-gray-900 border border-solid rounded-lg shadow-md dark:text-white bg-warm-gray-50 dark:bg-slate-900 overflow-clip text-ellipsis"
      style={{
        left: treemapPoint.x0,
        top: parseInt(treemapPoint.y0) - 30,
        height: '60px',
        width: '120px',
        marginBottom: '-60px',
      }}
    >
      {treemapPoint.data.title}
      <br />
      {treemapPoint.data.size}
    </div>
  );
};
