import { Box } from '@/components/ui/Box';
interface SubPageNavProps {
  children: JSX.Element;
}

export const SubPageNav = ({ children }: SubPageNavProps): JSX.Element => {
  return (
    <div>
      <Box
        variant={'defaults'}
        classes="w-full md:w-[710px] xl:w-[230px] break-words"
      >
        {children}
      </Box>
    </div>
  );
};
