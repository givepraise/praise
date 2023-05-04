import React from 'react';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRecoilValue } from 'recoil';
import { Link } from 'react-router-dom';
import { SingleSetting } from '@/model/settings/settings';

export const NavLogo = (): JSX.Element => {
  const logoSetting = useRecoilValue(SingleSetting('LOGO'));

  const [imageLoadError, setImageLoadError] = React.useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    setImageLoadError(false);
  }, [logoSetting]);

  return (
    <Link to={'/'}>
      {!imageLoaded && !imageLoadError && logoSetting?.valueRealized && (
        <div className="inline-block object-cover object-center w-32 h-32 border rounded-full" />
      )}
      {(imageLoadError || !logoSetting?.valueRealized) && (
        <FontAwesomeIcon
          icon={faPrayingHands}
          size="1x"
          className="inline-block object-cover object-center w-28 h-28 text-themecolor-3"
        />
      )}
      {logoSetting?.valueRealized && (
        <img
          src={logoSetting.valueRealized as string}
          onError={(): void => setImageLoadError(true)}
          onLoad={(): void => setImageLoaded(true)}
          alt="avatar"
          className="inline-block object-cover object-center w-32 h-32 border rounded-full"
          style={!imageLoaded ? { display: 'none' } : {}}
        />
      )}
    </Link>
  );
};
