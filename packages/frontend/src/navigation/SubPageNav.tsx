import { PraiseBox } from '@/components/ui/PraiseBox';
interface SubPageNavProps {
  children: JSX.Element;
}

export const SubPageNav = ({ children }: SubPageNavProps): JSX.Element => {
  return (
    <div>
      <PraiseBox
        variant={'defaults'}
        classes="w-full md:w-[710px] xl:w-[230px] break-words"
      >
        {children}
      </PraiseBox>
    </div>
  );
};
