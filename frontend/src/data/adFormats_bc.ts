import { AdFormat, AdSize, DeviceType, StayOnAdSize, SliderAdSize, IntAdSize, IntAdTags, SliderAdTags, StayOnAdTags } from '../types/AdFormat';
const images = import.meta.glob("../Img/*.{png,jpg,jpeg,svg}", { eager: true });

export const adFormatsAds = Object.keys(images).map((path) => {
  const fileName = path.split("/").pop()?.split(".")[0] || "";
  return {
    id: fileName.toLowerCase(),
    name: fileName.replace(/_/g, " "),
    image: (images[path] as any).default,
  };
});

const azNews = adFormatsAds.find((ad) => ad.id === "az_news");
const megasisNews = adFormatsAds.find((ad) => ad.id === "megasis_news");
const theGuardian = adFormatsAds.find((ad) => ad.id === "the_guardian");
const merandaNews = adFormatsAds.find((ad) => ad.id === "meranda");
const bsrvNews = adFormatsAds.find((ad) => ad.id === "bsrv");
const engadgetNews = adFormatsAds.find((ad) => ad.id === "engadget");
const wiredNews = adFormatsAds.find((ad) => ad.id === "wired");

export const adFormats: AdFormat[] = [
  {
    id: 'interstitial',
    name: 'Interstitial',
    type: 'display',
    category: 'Display',
    description: 'Full-screen ad that appears between content transitions',
    examples: [
      {
        id: 'int-1',
        title: 'AZ News',
        siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
        previewImage: azNews?.image,
        description: 'Full-screen mobile game advertisement'
      },
      {
        id: 'int-2',
        title: 'Megasis News',
        siteUrl: 'https://preview.colorlib.com/theme/megasis/post_details.html',
        previewImage: megasisNews?.image,
        description: 'Shopping app promotional interstitial'
      },
      {
        id: 'int-3',
        title: 'The Guardian',
        siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
        previewImage: theGuardian?.image,
        description: 'App installation promotional ad'
      },
      {
        id: 'int-4',
        title: 'Meranda',
        siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
        previewImage: merandaNews?.image,
        description: 'Brand awareness campaign ad'
      }
    ]
  },
  {
    id: 'slider',
    name: 'Slider',
    type: 'display',
    category: 'Display',
    description: 'Sliding banner that appears from the edge of the screen',
    examples: [
      {
        id: 'slider-1',
        title: 'AZ News',
        siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
        previewImage: azNews?.image,
        description: 'Sliding banner from bottom edge'
      },
      {
        id: 'slider-2',
        title: 'BSRV Test Page',
        siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
        previewImage: bsrvNews?.image,
        description: 'Sliding banner from side edge'
      },
      {
        id: 'slider-3',
        title: 'Engadget',
        siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
        previewImage: engadgetNews?.image,
        description: 'Sliding banner from top edge'
      },
      {
        id: 'slider-4',
        title: 'Meranda',
        siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
        previewImage: merandaNews?.image,
        description: 'Sliding banner from corner'
      }
    ]
  },
  {
    id: 'stay-on',
    name: 'Stay-On',
    type: 'display',
    category: 'Display',
    description: 'Fixed position ad that stays visible while scrolling',
    examples: [
      {
        id: 'stay-1',
        title: 'Megasis News',
        siteUrl: 'https://preview.colorlib.com/theme/megasis/post_details.html',
        previewImage: megasisNews?.image,
        description: 'Fixed banner at bottom of screen'
      },
      {
        id: 'stay-2',
        title: 'AZ News',
        siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
        previewImage: azNews?.image,
        description: 'Fixed banner at top of screen'
      },
      {
        id: 'stay-3',
        title: 'BSRV Test Page',
        siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
        previewImage: bsrvNews?.image,
        description: 'Floating ad in corner position'
      },
      {
        id: 'stay-4',
        title: 'Meranda',
        siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
        previewImage: merandaNews?.image,
        description: 'Fixed sidebar advertisement'
      }
    ]
  },
  {
    id: 'inread-player',
    name: 'InRead Player',
    type: 'video',
    category: 'Video',
    description: 'Video ad that plays within article content',
    examples: [
      {
        id: 'inread-1',
        title: 'Megasis News',
        siteUrl: 'https://preview.colorlib.com/theme/megasis/post_details.html',
        previewImage: megasisNews?.image,
        description: 'Video ad embedded in article'
      },
      {
        id: 'inread-2',
        title: 'The Guardian',
        siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
        previewImage: theGuardian?.image,
        description: 'Video player within news content'
      },
      {
        id: 'inread-3',
        title: 'AZ News',
        siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
        previewImage: azNews?.image,
        description: 'Video ad in blog post'
      },
      {
        id: 'inread-4',
        title: 'Meranda',
        siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
        previewImage: merandaNews?.image,
        description: 'Video player in magazine article'
      }
    ]
  },
  {
    id: 'inread-floating',
    name: 'InRead + Floating',
    type: 'video',
    category: 'Video',
    description: 'Video ad that starts in content and floats when scrolled',
    examples: [
      {
        id: 'floating-1',
        title: 'Megasis News',
        siteUrl: 'https://preview.colorlib.com/theme/megasis/post_details.html',
        previewImage: megasisNews?.image,
        description: 'Video that floats to corner'
      },
      {
        id: 'floating-2',
        title: 'Engadget',
        siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
        previewImage: engadgetNews?.image,
        description: 'Video player that sticks while scrolling'
      },
      {
        id: 'floating-3',
        title: 'Wired',
        siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
        previewImage: wiredNews?.image,
        description: 'Video that minimizes when scrolled'
      },
      {
        id: 'floating-4',
        title: 'TechRadar',
        siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
        previewImage: 'https://images.pexels.com/photos/3945329/pexels-photo-3945329.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Picture-in-picture video ad'
      }
    ]
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    type: 'video',
    category: 'Video',
    description: 'Video ad placed in sidebar area',
    examples: [
      {
        id: 'sidebar-1',
        title: 'AZ News',
        siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
        previewImage: azNews?.image,
        description: 'Video ad in right sidebar'
      },
      {
        id: 'sidebar-2',
        title: 'The Guardian',
        siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
        previewImage: theGuardian?.image,
        description: 'Video ad in left sidebar'
      },
      {
        id: 'sidebar-3',
        title: 'BSRV Test Page',
        siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
        previewImage: bsrvNews?.image,
        description: 'Video banner in sidebar'
      },
      {
        id: 'sidebar-4',
        title: 'Engadget',
        siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
        previewImage: engadgetNews?.image,
        description: 'Video unit in sidebar area'
      }
    ]
  }
];

export const adSizes: AdSize[] = [
  { width: 300, height: 250, label: 'Medium Rectangle', type: 'rectangle' },
  { width: 728, height: 90, label: 'Leaderboard', type: 'leaderboard' },
  { width: 320, height: 50, label: 'Mobile Banner', type: 'mobile' },
  { width: 300, height: 600, label: 'Half Page', type: 'skyscraper' },
  { width: 160, height: 600, label: 'Wide Skyscraper', type: 'skyscraper' },
  { width: 970, height: 250, label: 'Billboard', type: 'banner' },
  { width: 320, height: 100, label: 'Large Mobile Banner', type: 'mobile' },
  { width: 468, height: 60, label: 'Banner', type: 'banner' },
  { width: 970, height: 90, label: 'Leaderboard', type: 'leaderboard' },
];

export const sliderAdSizes: SliderAdSize[] = [
  { width: 300, height: 250, label: 'Desktop Size', type: 'medium' },
  { width: 350, height: 480, label: 'Desktop Size', type: 'large' },
  { width: 300, height: 600, label: 'Mobile Banner', type: 'medium' },
];

export const intAdSizes: IntAdSize[] = [
  { width: 300, height: 250, label: 'Desktop Size', type: 'medium' },
  { width: 320, height: 480, label: 'Desktop Size', type: 'large' },
  { width: 300, height: 600, label: 'Mobile Banner', type: 'medium' },
  { width: 360, height: 480, label: 'Mobile Banner', type: 'large' },
];

export const stayOnAdSizes: StayOnAdSize[] = [
  { width: 728, height: 90, label: 'Desktop Size', type: 'medium' },
  { width: 970, height: 90, label: 'Desktop Size', type: 'large' },
  { width: 320, height: 50, label: 'Mobile Banner', type: 'medium' },
  { width: 320, height: 100, label: 'Mobile Banner', type: 'large' },
];

export const deviceTypes: DeviceType[] = [
  { id: 'desktop', name: 'Desktop', width: 1200, height: 800, hasFrame: false },
  { id: 'mobile', name: 'Mobile', width: 375, height: 667, hasFrame: true },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, hasFrame: true },

];

export const intAdTags: IntAdTags[] = [
  {
    label: '300x250', tag: `<!-- BEGIN :: Demo-MW-INT-300x250-->
<div id='bsrv-8492'>
        <script src='https://bsrv-qa.bidsxchange.com/8492.js'></script>
        <script async src='https://hi-impact.bidsxchange.com/AdCode.js'></script>
                <script>
                window.bsrvtag=window.bsrvtag || {cmd: []};
                window.bsrvtag.cmd.push(function(adObj) {
                        adObj.AdSlot('bsrv-8492');
                        adObj.Meta('/bsrvptr645/bsrvplr843/bsrvadu8492/Demo-MW-INT-300x250');
                        adObj.CacheBuster('%%CACHEBUSTER%%');
                        adObj.UserConsent('0');
                        adObj.Domain('Demo2.com');
                        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                        adObj.ViewURL('%%VIEW_URL_UNESC%%');
                        adObj.Execute();
                });
        </script>
</div>
<!-- END :: Demo-MW-INT-300x250-->`},
  {
    label: '320x480', tag: `<!-- BEGIN :: Demo-MW-INT-320x480-->
<div id='bsrv-8493'>
        <script src='https://bsrv-qa.bidsxchange.com/8493.js'></script>
        <script async src='https://hi-impact.bidsxchange.com/AdCode.js'></script>
                <script>
                window.bsrvtag=window.bsrvtag || {cmd: []};
                window.bsrvtag.cmd.push(function(adObj) {
                        adObj.AdSlot('bsrv-8493');
                        adObj.Meta('/bsrvptr645/bsrvplr843/bsrvadu8493/Demo-MW-INT-320x480');
                        adObj.CacheBuster('%%CACHEBUSTER%%');
                        adObj.UserConsent('0');
                        adObj.Domain('Demo2.com');
                        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                        adObj.ViewURL('%%VIEW_URL_UNESC%%');
                        adObj.Execute();
                });
        </script>
</div>
<!-- END :: Demo-MW-INT-320x480-->` },
  {
    label: '300x600', tag: `<!-- BEGIN :: Demo-MW-INT-300x600-->
<div id='bsrv-8494'>
        <script src='https://bsrv-qa.bidsxchange.com/8494.js'></script>
        <script async src='https://hi-impact.bidsxchange.com/AdCode.js'></script>
                <script>
                window.bsrvtag=window.bsrvtag || {cmd: []};
                window.bsrvtag.cmd.push(function(adObj) {
                        adObj.AdSlot('bsrv-8494');
                        adObj.Meta('/bsrvptr645/bsrvplr843/bsrvadu8494/Demo-MW-INT-300x600');
                        adObj.CacheBuster('%%CACHEBUSTER%%');
                        adObj.UserConsent('0');
                        adObj.Domain('Demo2.com');
                        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                        adObj.ViewURL('%%VIEW_URL_UNESC%%');
                        adObj.Execute();
                });
        </script>
</div>
<!-- END :: Demo-MW-INT-300x600-->`},
  {
    label: '360x480', tag: `<!-- BEGIN :: Demo-MW-INT-360x480-->
<div id='bsrv-8495'>
        <script src='https://bsrv-qa.bidsxchange.com/8495.js'></script>
        <script async src='https://hi-impact.bidsxchange.com/AdCode.js'></script>
                <script>
                window.bsrvtag=window.bsrvtag || {cmd: []};
                window.bsrvtag.cmd.push(function(adObj) {
                        adObj.AdSlot('bsrv-8495');
                        adObj.Meta('/bsrvptr645/bsrvplr843/bsrvadu8495/Demo-MW-INT-360x480');
                        adObj.CacheBuster('%%CACHEBUSTER%%');
                        adObj.UserConsent('0');
                        adObj.Domain('Demo2.com');
                        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                        adObj.ViewURL('%%VIEW_URL_UNESC%%');
                        adObj.Execute();
                });
        </script>
</div>
<!-- END :: Demo-MW-INT-360x480-->` },
];

export const stayOnAdTags: StayOnAdTags[] = [
  { label: '728x90', device: 'Desktop', tag: `<!-- BEGIN :: Demo-DSK-SO-728x90-->
<div id='bsrv-8481'>
        <script src='https://bsrv-qa.bidsxchange.com/8481.js'></script>
        <script async src='https://hi-impact.bidsxchange.com/AdCode.js'></script>
                <script>
                window.bsrvtag=window.bsrvtag || {cmd: []};
                window.bsrvtag.cmd.push(function(adObj) {
                        adObj.AdSlot('bsrv-8481');
                        adObj.Meta('/bsrvptr645/bsrvplr843/bsrvadu8481/Demo-DSK-SO-728x90');
                        adObj.CacheBuster('%%CACHEBUSTER%%');
                        adObj.UserConsent('0');
                        adObj.Domain('Demo2.com');
                        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                        adObj.ViewURL('%%VIEW_URL_UNESC%%');
                        adObj.Execute();
                });
        </script>
</div>
<!-- END :: Demo-DSK-SO-728x90-->` },
  { label: '970x90', device: 'Desktop', tag: `<!-- BEGIN :: Demo-DSK-SO-970x90-->
<div id='bsrv-8482'>
        <script src='https://bsrv-qa.bidsxchange.com/8482.js'></script>
        <script async src='https://hi-impact.bidsxchange.com/AdCode.js'></script>
                <script>
                window.bsrvtag=window.bsrvtag || {cmd: []};
                window.bsrvtag.cmd.push(function(adObj) {
                        adObj.AdSlot('bsrv-8482');
                        adObj.Meta('/bsrvptr645/bsrvplr843/bsrvadu8482/Demo-DSK-SO-970x90');
                        adObj.CacheBuster('%%CACHEBUSTER%%');
                        adObj.UserConsent('0');
                        adObj.Domain('Demo2.com');
                        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                        adObj.ViewURL('%%VIEW_URL_UNESC%%');
                        adObj.Execute();
                });
        </script>
</div>
<!-- END :: Demo-DSK-SO-970x90-->` },
  { label: '300x250', device: 'Desktop', tag: `<!-- BEGIN :: Demo-DSK-SO-300x250-->
<div id='bsrv-8483'>
        <script src='https://bsrv-qa.bidsxchange.com/8483.js'></script>
        <script async src='https://hi-impact.bidsxchange.com/AdCode.js'></script>
                <script>
                window.bsrvtag=window.bsrvtag || {cmd: []};
                window.bsrvtag.cmd.push(function(adObj) {
                        adObj.AdSlot('bsrv-8483');
                        adObj.Meta('/bsrvptr645/bsrvplr843/bsrvadu8483/Demo-DSK-SO-300x250');
                        adObj.CacheBuster('%%CACHEBUSTER%%');
                        adObj.UserConsent('0');
                        adObj.Domain('Demo2.com');
                        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                        adObj.ViewURL('%%VIEW_URL_UNESC%%');
                        adObj.Execute();
                });
        </script>
</div>
<!-- END :: Demo-DSK-SO-300x250-->
` },
  { label: '320x50', device: 'Desktop', tag: `<!-- BEGIN :: Demo-MW-SO-320x50-->
<div id='bsrv-8484'>
        <script src='https://bsrv-qa.bidsxchange.com/8484.js'></script>
        <script async src='https://hi-impact.bidsxchange.com/AdCode.js'></script>
                <script>
                window.bsrvtag=window.bsrvtag || {cmd: []};
                window.bsrvtag.cmd.push(function(adObj) {
                        adObj.AdSlot('bsrv-8484');
                        adObj.Meta('/bsrvptr645/bsrvplr843/bsrvadu8484/Demo-MW-SO-320x50');
                        adObj.CacheBuster('%%CACHEBUSTER%%');
                        adObj.UserConsent('0');
                        adObj.Domain('Demo2.com');
                        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                        adObj.ViewURL('%%VIEW_URL_UNESC%%');
                        adObj.Execute();
                });
        </script>
</div>
<!-- END :: Demo-MW-SO-320x50-->
` },
  { label: '320x100', device: 'Desktop', tag: `<!-- BEGIN :: Demo-MW-SO-320x100-->
<div id='bsrv-8485'>
        <script src='https://bsrv-qa.bidsxchange.com/8485.js'></script>
        <script async src='https://hi-impact.bidsxchange.com/AdCode.js'></script>
                <script>
                window.bsrvtag=window.bsrvtag || {cmd: []};
                window.bsrvtag.cmd.push(function(adObj) {
                        adObj.AdSlot('bsrv-8485');
                        adObj.Meta('/bsrvptr645/bsrvplr843/bsrvadu8485/Demo-MW-SO-320x100');
                        adObj.CacheBuster('%%CACHEBUSTER%%');
                        adObj.UserConsent('0');
                        adObj.Domain('Demo2.com');
                        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                        adObj.ViewURL('%%VIEW_URL_UNESC%%');
                        adObj.Execute();
                });
        </script>
</div>
<!-- END :: Demo-MW-SO-320x100-->` },
  { label: '300x250', device: 'Desktop', tag: `<!-- BEGIN :: Demo-MW-SO-300x250-->
<div id='bsrv-8486'>
        <script src='https://bsrv-qa.bidsxchange.com/8486.js'></script>
        <script async src='https://hi-impact.bidsxchange.com/AdCode.js'></script>
                <script>
                window.bsrvtag=window.bsrvtag || {cmd: []};
                window.bsrvtag.cmd.push(function(adObj) {
                        adObj.AdSlot('bsrv-8486');
                        adObj.Meta('/bsrvptr645/bsrvplr843/bsrvadu8486/Demo-MW-SO-300x250');
                        adObj.CacheBuster('%%CACHEBUSTER%%');
                        adObj.UserConsent('0');
                        adObj.Domain('Demo2.com');
                        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                        adObj.ViewURL('%%VIEW_URL_UNESC%%');
                        adObj.Execute();
                });
        </script>
</div>
<!-- END :: Demo-MW-SO-300x250-->` },
];

export const sliderAdTags: SliderAdTags[] = [
  {
    label: '300x250', tag: `<!-- BEGIN :: Demo-MW-SLDR-300x250-->
<div id='bsrv-8487'>
        <script src='https://bsrv-qa.bidsxchange.com/8487.js'></script>
        <script async src='https://hi-impact.bidsxchange.com/AdCode.js'></script>
                <script>
                window.bsrvtag=window.bsrvtag || {cmd: []};
                window.bsrvtag.cmd.push(function(adObj) {
                        adObj.AdSlot('bsrv-8487');
                        adObj.Meta('/bsrvptr645/bsrvplr843/bsrvadu8487/Demo-MW-SLDR-300x250');
                        adObj.CacheBuster('%%CACHEBUSTER%%');
                        adObj.UserConsent('0');
                        adObj.Domain('Demo2.com');
                        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                        adObj.ViewURL('%%VIEW_URL_UNESC%%');
                        adObj.Execute();
                });
        </script>
</div>
<!-- END :: Demo-MW-SLDR-300x250-->` },
  {
    label: '300x600', tag: `<!-- BEGIN :: Demo-MW-SLDR-300x600-->
<div id='bsrv-8489'>
        <script src='https://bsrv-qa.bidsxchange.com/8489.js'></script>
        <script async src='https://hi-impact.bidsxchange.com/AdCode.js'></script>
                <script>
                window.bsrvtag=window.bsrvtag || {cmd: []};
                window.bsrvtag.cmd.push(function(adObj) {
                        adObj.AdSlot('bsrv-8489');
                        adObj.Meta('/bsrvptr645/bsrvplr843/bsrvadu8489/Demo-MW-SLDR-300x600');
                        adObj.CacheBuster('%%CACHEBUSTER%%');
                        adObj.UserConsent('0');
                        adObj.Domain('Demo2.com');
                        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
                        adObj.ViewURL('%%VIEW_URL_UNESC%%');
                        adObj.Execute();
                });
        </script>
</div>
<!-- END :: Demo-MW-SLDR-300x600-->` }
];