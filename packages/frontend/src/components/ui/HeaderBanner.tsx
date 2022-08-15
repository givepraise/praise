import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRecoilState } from 'recoil';
import { IsHeaderBannerClosed } from '@/model/app';

interface HeaderBannerProps {
  bannerKey: string;
  children: JSX.Element | JSX.Element[] | string;
}

export const HeaderBanner = ({
  bannerKey,
  children,
}: HeaderBannerProps): JSX.Element => {
  const [isBannerClosed, setIsBannerClosed] = useRecoilState(
    IsHeaderBannerClosed(bannerKey)
  );

  const handleClose = (): void => {
    setIsBannerClosed(true);
  };

  return (
    <>
      {!isBannerClosed && (
        <div className="sticky top-0 flex items-center justify-center p-3 text-center bg-opacity-50 bg-warm-gray-100 lg:pl-64">
          <div className="ml-auto">{children}</div>
          <div className="ml-auto">
            <button className="praise-button-round" onClick={handleClose}>
              <FontAwesomeIcon icon={faTimes} size="1x" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
