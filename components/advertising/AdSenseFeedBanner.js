import AdSenseBanner from './AdSenseBanner';

export default function AdSenseFeedBanner({ enabled = true }) {
  return (
    <AdSenseBanner
      slotName="feed"
      enabled={enabled}
      minHeight={96}
    />
  );
}
