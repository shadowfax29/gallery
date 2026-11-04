// import { AdFormat, AdSize, DeviceType, StayOnAdSize, SliderAdSize, IntAdSize, IntAdTags, SliderAdTags, StayOnAdTags } from '../types/AdFormat';

// export const adFormats: AdFormat[] = [
//   {
//     id: 'interstitial',
//     name: 'Interstitial',
//     type: 'display',
//     category: 'Display',
//     description: 'Full-screen ad that appears between content transitions',
//     examples: [
//       {
//         id: 'int-1',
//         title: 'AZ News',
//         siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Full-screen mobile game advertisement'
//       },
//       {
//         id: 'int-2',
//         title: 'Megasis News',
//         siteUrl: 'https://preview.colorlib.com/theme/megasis/post_details.html',
//         previewImage: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Shopping app promotional interstitial'
//       },
//       {
//         id: 'int-3',
//         title: 'The Guardian',
//         siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
//         previewImage: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'App installation promotional ad'
//       },
//       {
//         id: 'int-4',
//         title: 'Meranda',
//         siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
//         previewImage: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Brand awareness campaign ad'
//       }
//     ]
//   },
//   {
//     id: 'slider',
//     name: 'Slider',
//     type: 'display',
//     category: 'Display',
//     description: 'Sliding banner that appears from the edge of the screen',
//     examples: [
//       {
//         id: 'slider-1',
//         title: 'AZ News',
//         siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Sliding banner from bottom edge'
//       },
//       {
//         id: 'slider-2',
//         title: 'TMSRV Test Page',
//         siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
//         previewImage: 'https://images.pexels.com/photos/267371/pexels-photo-267371.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Sliding banner from side edge'
//       },
//       {
//         id: 'slider-3',
//         title: 'News Latest',
//         siteUrl: 'https://preview.colorlib.com/theme/news/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Sliding banner from top edge'
//       },
//       {
//         id: 'slider-4',
//         title: 'Meranda',
//         siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
//         previewImage: 'https://images.pexels.com/photos/267373/pexels-photo-267373.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Sliding banner from corner'
//       }
//     ]
//   },
//   {
//     id: 'stay-on',
//     name: 'Stay-On',
//     type: 'display',
//     category: 'Display',
//     description: 'Fixed position ad that stays visible while scrolling',
//     examples: [
//       {
//         id: 'stay-1',
//         title: 'Megasis News',
//         siteUrl: 'https://preview.colorlib.com/theme/megasis/post_details.html',
//         previewImage: 'https://images.pexels.com/photos/267399/pexels-photo-267399.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Fixed banner at bottom of screen'
//       },
//       {
//         id: 'stay-2',
//         title: 'AZ News',
//         siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Fixed banner at top of screen'
//       },
//       {
//         id: 'stay-3',
//         title: 'TMSRV Test Page',
//         siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
//         previewImage: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Floating ad in corner position'
//       },
//       {
//         id: 'stay-4',
//         title: 'Meranda',
//         siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
//         previewImage: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Fixed sidebar advertisement'
//       }
//     ]
//   },
//   {
//     id: 'remnant',
//     name: 'Remnant Ads',
//     type: 'display',
//     category: 'Display',
//     description: 'Banner ads shown on dedicated ad slots on the webpage for maximum fill rate.',
//     examples: [
//       {
//         id: 'remnant-1',
//         title: 'AZ News',
//         siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Remnant banner in sidebar slot'
//       },
//       {
//         id: 'remnant-2',
//         title: 'Megasis News',
//         siteUrl: 'https://preview.colorlib.com/theme/megasis/post_details.html',
//         previewImage: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Remnant banner under content'
//       },
//       {
//         id: 'remnant-3',
//         title: 'The Guardian',
//         siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
//         previewImage: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Remnant leaderboard placement'
//       },
//       {
//         id: 'remnant-4',
//         title: 'Meranda',
//         siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
//         previewImage: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Remnant half-page banner'
//       }
//     ]
//   },
//   {
//     id: 'inread-player',
//     name: 'InRead Player',
//     type: 'video',
//     category: 'Video',
//     description: 'Video ad that plays within article content',
//     examples: [
//       {
//         id: 'inread-1',
//         title: 'Megasis News',
//         siteUrl: 'https://preview.colorlib.com/theme/megasis/post_details.html',
//         previewImage: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Video ad embedded in article'
//       },
//       {
//         id: 'inread-2',
//         title: 'The Guardian',
//         siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
//         previewImage: 'https://images.pexels.com/photos/3945317/pexels-photo-3945317.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Video player within news content'
//       },
//       {
//         id: 'inread-3',
//         title: 'AZ News',
//         siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/3945319/pexels-photo-3945319.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Video ad in blog post'
//       },
//       {
//         id: 'inread-4',
//         title: 'Meranda',
//         siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
//         previewImage: 'https://images.pexels.com/photos/3945321/pexels-photo-3945321.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Video player in magazine article'
//       }
//     ]
//   },
//   {
//     id: 'inread-floating',
//     name: 'InRead + Floating',
//     type: 'video',
//     category: 'Video',
//     description: 'Video ad that starts in content and floats when scrolled',
//     examples: [
//       {
//         id: 'floating-1',
//         title: 'Megasis News',
//         siteUrl: 'https://preview.colorlib.com/theme/megasis/post_details.html',
//         previewImage: 'https://images.pexels.com/photos/3945323/pexels-photo-3945323.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Video that floats to corner'
//       },
//       {
//         id: 'floating-2',
//         title: 'Engadget',
//         siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
//         previewImage: 'https://images.pexels.com/photos/3945325/pexels-photo-3945325.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Video player that sticks while scrolling'
//       },
//       {
//         id: 'floating-3',
//         title: 'Wired',
//         siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/3945337/pexels-photo-3945337.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Video that minimizes when scrolled'
//       },
//       {
//         id: 'floating-4',
//         title: 'TechRadar',
//         siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
//         previewImage: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Picture-in-picture video ad'
//       }
//     ]
//   },
//   {
//     id: 'sidebar',
//     name: 'Sidebar',
//     type: 'video',
//     category: 'Video',
//     description: 'Video ad placed in sidebar area',
//     examples: [
//       {
//         id: 'sidebar-1',
//         title: 'AZ News',
//         siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Video ad in right sidebar'
//       },
//       {
//         id: 'sidebar-2',
//         title: 'The Guardian',
//         siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
//         previewImage: 'https://images.pexels.com/photos/3945333/pexels-photo-3945333.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Video ad in left sidebar'
//       },
//       {
//         id: 'sidebar-3',
//         title: 'TMSRV Test Page',
//         siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
//         previewImage: 'https://images.pexels.com/photos/267371/pexels-photo-267371.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Video banner in sidebar'
//       },
//       {
//         id: 'sidebar-4',
//         title: 'News Latest',
//         siteUrl: 'https://preview.colorlib.com/theme/news/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/3945337/pexels-photo-3945337.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Video unit in sidebar area'
//       }
//     ]
//   },
//   {
//     id: 'hybrid-video',
//     name: 'Hybrid Video',
//     type: 'video',
//     category: 'Video',
//     description: 'Hybrid video format where when the player is out of view, it loads high-impact creative formats.',
//     examples: [
//       {
//         id: 'hybrid-1',
//         title: 'AZ News',
//         siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Hybrid video ad in high-impact creative formats'
//       },
//       {
//         id: 'hybrid-2',
//         title: 'The Guardian',
//         siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
//         previewImage: 'https://images.pexels.com/photos/3945333/pexels-photo-3945333.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Hybrid video player in high-impact creative formats'
//       },
//       {
//         id: 'hybrid-3',
//         title: 'TMSRV Test Page',
//         siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
//         previewImage: 'https://images.pexels.com/photos/267371/pexels-photo-267371.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Hybrid video load when there is no ad'
//       },
//       {
//         id: 'hybrid-4',
//         title: 'News Latest',
//         siteUrl: 'https://preview.colorlib.com/theme/news/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/3945337/pexels-photo-3945337.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Hybrid video unit in hybrid area'
//       }
//     ]
//   },
//   {
//     id: 'ribbon-player',
//     name: 'Ribbon Player',
//     type: 'video',
//     category: 'Video',
//     description: 'Ribbon-style video player that elegantly slides into view, offering premium video advertising with minimal disruption.',
//     examples: [
//       {
//         id: 'ribbon-1',
//         title: 'AZ News',
//         siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Ribbon player ad in high-impact creative formats'
//       },
//       {
//         id: 'ribbon-2',
//         title: 'The Guardian',
//         siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
//         previewImage: 'https://images.pexels.com/photos/3945333/pexels-photo-3945333.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Ribbon player in high-impact creative formats'
//       },
//       {
//         id: 'ribbon-3',
//         title: 'TMSRV Test Page',
//         siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
//         previewImage: 'https://images.pexels.com/photos/267371/pexels-photo-267371.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Ribbon player load when there is no ad'
//       },
//       {
//         id: 'ribbon-4',
//         title: 'News Latest',
//         siteUrl: 'https://preview.colorlib.com/theme/news/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/3945337/pexels-photo-3945337.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Ribbon player unit in ribbon area'
//       }
//     ]
//   },
//   {
//     id: 'rewarded-ad',
//     name: 'Rewarded Ad',
//     type: 'video',
//     category: 'Video',
//     description: 'Rewarded video ads that offer incentives for viewing, creating a win-win advertising experience.',
//     examples: [
//       {
//         id: 'rewarded-1',
//         title: 'AZ News',
//         siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Rewarded ad in high-impact creative formats'
//       },
//       {
//         id: 'rewarded-2',
//         title: 'The Guardian',
//         siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
//         previewImage: 'https://images.pexels.com/photos/3945333/pexels-photo-3945333.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Rewarded ad in high-impact creative formats'
//       },
//       {
//         id: 'rewarded-3',
//         title: 'TMSRV Test Page',
//         siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
//         previewImage: 'https://images.pexels.com/photos/267371/pexels-photo-267371.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Rewarded ad load when there is no ad'
//       },
//       {
//         id: 'rewarded-4',
//         title: 'News Latest',
//         siteUrl: 'https://preview.colorlib.com/theme/news/latest_news.html',
//         previewImage: 'https://images.pexels.com/photos/3945337/pexels-photo-3945337.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
//         description: 'Rewarded ad unit in ribbon area'
//       }
//     ]
//   }
// ];

// export const adSizes: AdSize[] = [
//   { width: 300, height: 250, label: 'Medium Rectangle', type: 'rectangle' },
//   { width: 728, height: 90, label: 'Leaderboard', type: 'leaderboard' },
//   { width: 320, height: 50, label: 'Mobile Banner', type: 'mobile' },
//   { width: 300, height: 600, label: 'Half Page', type: 'skyscraper' },
//   { width: 160, height: 600, label: 'Wide Skyscraper', type: 'skyscraper' },
//   { width: 970, height: 250, label: 'Billboard', type: 'banner' },
//   { width: 320, height: 100, label: 'Large Mobile Banner', type: 'mobile' },
//   { width: 468, height: 60, label: 'Banner', type: 'banner' },
//   { width: 970, height: 90, label: 'Leaderboard', type: 'leaderboard' },
// ];

// export const sliderAdSizes: SliderAdSize[] = [
//   { width: 300, height: 250, label: 'Desktop Size', type: 'medium' },
//   { width: 350, height: 480, label: 'Desktop Size', type: 'large' },
//   { width: 300, height: 600, label: 'Mobile Banner', type: 'medium' },
// ];

// export const intAdSizes: IntAdSize[] = [
//   { width: 300, height: 250, label: 'Desktop Size', type: 'medium' },
//   { width: 320, height: 480, label: 'Desktop Size', type: 'medium' },
//   { width: 300, height: 600, label: 'Mobile Banner', type: 'medium' },
//   { width: 360, height: 480, label: 'Mobile Banner', type: 'medium' },
// ];

// export const stayOnAdSizes: StayOnAdSize[] = [
//   { width: 728, height: 90, label: 'Desktop Size', type: 'medium' },
//   { width: 970, height: 90, label: 'Desktop Size', type: 'large' },
//   { width: 320, height: 50, label: 'Mobile Banner', type: 'medium' },
//   { width: 320, height: 100, label: 'Mobile Banner', type: 'large' },
// ];

// export const deviceTypes: DeviceType[] = [
//   { id: 'desktop', name: 'Desktop', width: 1200, height: 800, hasFrame: false },
//   { id: 'mobile', name: 'Mobile', width: 375, height: 667, hasFrame: true },
//   { id: 'tablet', name: 'Tablet', width: 768, height: 1024, hasFrame: true },

// ];

// export const intAdTags: IntAdTags[] = [
//   {
//     label: '320x480', tag: `
// <div id='tmsrv-9400'>
// 	<script src='https://srv-qa.tmadsrv.com/9400.js'></script>
// 	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
// 		<script>
// 		window.tmsrv=window.tmsrv || {cmd: []};
// 		window.tmsrv.cmd.push(function(adObj) {
// 			adObj.AdSlot('tmsrv-9400');
// 			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9400/TPMS-Gallery-test-Interstatial-320x480');
// 			adObj.CacheBuster('%%CACHEBUSTER%%');
// 			adObj.UserConsent('0');
// 			adObj.Domain('test06/11.com');
// 			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
// 			adObj.ViewURL('%%VIEW_URL_UNESC%%');
// 			adObj.Execute();
// 		});
// 	</script>
// </div>

// `  },
//   {
//     label: '300x250', tag: `<!-- BEGIN :: TPMS-Gallery-test-Interstatial-300x250-->
// <div id='tmsrv-9401'>
// 	<script src='https://srv-qa.tmadsrv.com/9401.js'></script>
// 	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
// 		<script>
// 		window.tmsrv=window.tmsrv || {cmd: []};
// 		window.tmsrv.cmd.push(function(adObj) {
// 			adObj.AdSlot('tmsrv-9401');
// 			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9401/TPMS-Gallery-test-Interstatial-300x250');
// 			adObj.CacheBuster('%%CACHEBUSTER%%');
// 			adObj.UserConsent('0');
// 			adObj.Domain('test06/11.com');
// 			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
// 			adObj.ViewURL('%%VIEW_URL_UNESC%%');
// 			adObj.Execute();
// 		});
// 	</script>
// </div>
// <!-- END :: TPMS-Gallery-test-Interstatial-300x250-->
// `},
//   {
//     label: '300x600', tag: `
// <div id='tmsrv-9411'>
// 	<script src='https://srv-qa.tmadsrv.com/9411.js'></script>
// 	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
// 		<script>
// 		window.tmsrv=window.tmsrv || {cmd: []};
// 		window.tmsrv.cmd.push(function(adObj) {
// 			adObj.AdSlot('tmsrv-9411');
// 			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9411/TPMS-Gallery-test-Interstatial-300x600');
// 			adObj.CacheBuster('%%CACHEBUSTER%%');
// 			adObj.UserConsent('0');
// 			adObj.Domain('test06/11.com');
// 			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
// 			adObj.ViewURL('%%VIEW_URL_UNESC%%');
// 			adObj.Execute();
// 		});
// 	</script>
// </div>
// `},
//   {
//     label: '360x480', tag: `<div id='tmsrv-8759'>
//     <script src='https://srv-qa.tmadsrv.com/8759.js'></script>
//     <script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
//       <script>
//       window.tmsrv=window.tmsrv || {cmd: []};
//       window.tmsrv.cmd.push(function(adObj) {
//         adObj.AdSlot('tmsrv-8759');
//         adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu8759/Demo-test-INT-360x480');
//         adObj.CacheBuster('%%CACHEBUSTER%%');
//         adObj.UserConsent('0');
//         adObj.Domain('test06/11.com');
//         adObj.ClickUrl('%%CLICK_URL_UNESC%%');
//         adObj.ViewURL('%%VIEW_URL_UNESC%%');
//         adObj.Execute();
//       });
//     </script>
//   </div>` },
// ];

// export const stayOnAdTags: StayOnAdTags[] = [
//   {
//     label: '728x90', device: 'Desktop', tag: `<div id='tmsrv-9405'>
// 	<script src='https://srv-qa.tmadsrv.com/9405.js'></script>
// 	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
// 		<script>
// 		window.tmsrv=window.tmsrv || {cmd: []};
// 		window.tmsrv.cmd.push(function(adObj) {
// 			adObj.AdSlot('tmsrv-9405');
// 			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9405/TPMS-Gallery-test-stayon-728x90');
// 			adObj.CacheBuster('%%CACHEBUSTER%%');
// 			adObj.UserConsent('0');
// 			adObj.Domain('test06/11.com');
// 			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
// 			adObj.ViewURL('%%VIEW_URL_UNESC%%');
// 			adObj.Execute();
// 		});
// 	</script>
// </div>` },
//   {
//     label: '970x90', device: 'Desktop', tag: `<div id='tmsrv-9406'>
// 	<script src='https://srv-qa.tmadsrv.com/9406.js'></script>
// 	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
// 		<script>
// 		window.tmsrv=window.tmsrv || {cmd: []};
// 		window.tmsrv.cmd.push(function(adObj) {
// 			adObj.AdSlot('tmsrv-9406');
// 			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9406/TPMS-Gallery-test-stayon-970x90');
// 			adObj.CacheBuster('%%CACHEBUSTER%%');
// 			adObj.UserConsent('0');
// 			adObj.Domain('test06/11.com');
// 			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
// 			adObj.ViewURL('%%VIEW_URL_UNESC%%');
// 			adObj.Execute();
// 		});
// 	</script>
// </div>` },
//   {
//     label: '300x250', device: 'Desktop', tag: `<div id='tmsrv-9407'>
// 	<script src='https://srv-qa.tmadsrv.com/9407.js'></script>
// 	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
// 		<script>
// 		window.tmsrv=window.tmsrv || {cmd: []};
// 		window.tmsrv.cmd.push(function(adObj) {
// 			adObj.AdSlot('tmsrv-9407');
// 			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9407/TPMS-Gallery-test-stayon-300x250');
// 			adObj.CacheBuster('%%CACHEBUSTER%%');
// 			adObj.UserConsent('0');
// 			adObj.Domain('test06/11.com');
// 			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
// 			adObj.ViewURL('%%VIEW_URL_UNESC%%');
// 			adObj.Execute();
// 		});
// 	</script>
// </div>` },
//   {
//     label: '320x50', device: 'Desktop', tag: `<div id='tmsrv-8765'>
//     <script src='https://srv-qa.tmadsrv.com/8765.js'></script>
//     <script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
//       <script>
//       window.tmsrv=window.tmsrv || {cmd: []};
//       window.tmsrv.cmd.push(function(adObj) {
//         adObj.AdSlot('tmsrv-8765');
//         adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu8765/Demo-test-SO-320x50');
//         adObj.CacheBuster('%%CACHEBUSTER%%');
//         adObj.UserConsent('0');
//         adObj.Domain('test06/11.com');
//         adObj.ClickUrl('%%CLICK_URL_UNESC%%');
//         adObj.ViewURL('%%VIEW_URL_UNESC%%');
//         adObj.Execute();
//       });
//     </script>
//   </div>` },
//   {
//     label: '320x100', device: 'Desktop', tag: `<div id='tmsrv-8766'>
//     <script src='https://srv-qa.tmadsrv.com/8766.js'></script>
//     <script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
//         <script>
//         window.tmsrv=window.tmsrv || {cmd: []};
//         window.tmsrv.cmd.push(function(adObj) {
//             adObj.AdSlot('tmsrv-8766');
//             adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu8766/Demo-test-SO-320x100');
//             adObj.CacheBuster('%%CACHEBUSTER%%');
//             adObj.UserConsent('0');
//             adObj.Domain('test06/11.com');
//             adObj.ClickUrl('%%CLICK_URL_UNESC%%');
//             adObj.ViewURL('%%VIEW_URL_UNESC%%');
//             adObj.Execute();
//         });
//     </script>
// </div>` },
//   {
//     label: '300x250', device: 'Desktop', tag: `<div id='tmsrv-8764'>
//     <script src='https://srv-qa.tmadsrv.com/8764.js'></script>
//     <script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
//       <script>
//       window.tmsrv=window.tmsrv || {cmd: []};
//       window.tmsrv.cmd.push(function(adObj) {
//         adObj.AdSlot('tmsrv-8764');
//         adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu8764/Demo-test-SO-300x250');
//         adObj.CacheBuster('%%CACHEBUSTER%%');
//         adObj.UserConsent('0');
//         adObj.Domain('test06/11.com');
//         adObj.ClickUrl('%%CLICK_URL_UNESC%%');
//         adObj.ViewURL('%%VIEW_URL_UNESC%%');
//         adObj.Execute();
//       });
//     </script>
//   </div>` },
// ];

// export const sliderAdTags: SliderAdTags[] = [
//   {
//     label: '300x250', tag: `<div id='tmsrv-9403'>
// 	<script src='https://srv-qa.tmadsrv.com/9403.js'></script>
// 	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
// 		<script>
// 		window.tmsrv=window.tmsrv || {cmd: []};
// 		window.tmsrv.cmd.push(function(adObj) {
// 			adObj.AdSlot('tmsrv-9403');
// 			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9403/TPMS-Gallery-test-Slider-300x250');
// 			adObj.CacheBuster('%%CACHEBUSTER%%');
// 			adObj.UserConsent('0');
// 			adObj.Domain('test06/11.com');
// 			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
// 			adObj.ViewURL('%%VIEW_URL_UNESC%%');
// 			adObj.Execute();
// 		});
// 	</script>
// </div>` },
//   {
//     label: '300x600', tag: `<div id='tmsrv-9402'>
// 	<script src='https://srv-qa.tmadsrv.com/9402.js'></script>
// 	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
// 		<script>
// 		window.tmsrv=window.tmsrv || {cmd: []};
// 		window.tmsrv.cmd.push(function(adObj) {
// 			adObj.AdSlot('tmsrv-9402');
// 			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9402/TPMS-Gallery-test-Slider-300x600');
// 			adObj.CacheBuster('%%CACHEBUSTER%%');
// 			adObj.UserConsent('0');
// 			adObj.Domain('test06/11.com');
// 			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
// 			adObj.ViewURL('%%VIEW_URL_UNESC%%');
// 			adObj.Execute();
// 		});
// 	</script>
// </div>` }
// ];

// // export const remnantAdTags: { label: string; tag: string }[] = [
// //   {
// //     label: '300x250', tag: `<script  id='fsrv-3571' src='https://test-fsrv.bidsxchange.com/3571.js'></script>`
// //   },
// //   {
// //     label: '728x90', tag: `<script  id='fsrv-3570' src='https://test-fsrv.bidsxchange.com/3570.js'></script>`
// //   },
// //   {
// //     label: '300x600', tag: `<script  id='fsrv-3628' src='https://test-fsrv.bidsxchange.com/3628.js'></script>`
// //   },
// //   {
// //     label: '320x50', tag: `<script  id='fsrv-3572' src='https://test-fsrv.bidsxchange.com/3572.js'></script>`
// //   },
// //   {
// //     label: '320x100', tag: `<script  id='hads-3721' src='https://hads.tmadsrv.com/3721.js'></script>`
// //   }
// // ];
// export const remnantAdTags: { label: string; tag: string }[] = [
//   {
//     label: '300x250', tag: `<div id='tmsrv-9408'>
// 	<script src='https://srv-qa.tmadsrv.com/9408.js'></script>
// 	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
// 		<script>
// 		window.tmsrv=window.tmsrv || {cmd: []};
// 		window.tmsrv.cmd.push(function(adObj) {
// 			adObj.AdSlot('tmsrv-9408');
// 			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9408/TPMS-Gallery-test-Banner-300x250');
// 			adObj.CacheBuster('%%CACHEBUSTER%%');
// 			adObj.UserConsent('0');
// 			adObj.Domain('test06/11.com');
// 			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
// 			adObj.ViewURL('%%VIEW_URL_UNESC%%');
// 			adObj.Execute();
// 		});
// 	</script>
// </div>`
//   },
//   {
//     label: '728x90', tag: `<div id='tmsrv-9409'>
// 	<script src='https://srv-qa.tmadsrv.com/9409.js'></script>
// 	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
// 		<script>
// 		window.tmsrv=window.tmsrv || {cmd: []};
// 		window.tmsrv.cmd.push(function(adObj) {
// 			adObj.AdSlot('tmsrv-9409');
// 			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9409/TPMS-Gallery-test-Banner-728x90');
// 			adObj.CacheBuster('%%CACHEBUSTER%%');
// 			adObj.UserConsent('0');
// 			adObj.Domain('test06/11.com');
// 			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
// 			adObj.ViewURL('%%VIEW_URL_UNESC%%');
// 			adObj.Execute();
// 		});
// 	</script>
// </div>`
//   },
//   {
//     label: '300x600', tag: `<div id='tmsrv-9410'>
// 	<script src='https://srv-qa.tmadsrv.com/9410.js'></script>
// 	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
// 		<script>
// 		window.tmsrv=window.tmsrv || {cmd: []};
// 		window.tmsrv.cmd.push(function(adObj) {
// 			adObj.AdSlot('tmsrv-9410');
// 			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9410/TPMS-Gallery-test-Banner-300x600');
// 			adObj.CacheBuster('%%CACHEBUSTER%%');
// 			adObj.UserConsent('0');
// 			adObj.Domain('test06/11.com');
// 			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
// 			adObj.ViewURL('%%VIEW_URL_UNESC%%');
// 			adObj.Execute();
// 		});
// 	</script>
// </div>`
//   },
//   {
//     label: '320x50', tag: `<script  id='fsrv-3572' src='https://test-fsrv.bidsxchange.com/3572.js'></script>`
//   },
//   {
//     label: '320x100', tag: `<script  id='hads-3721' src='https://hads.tmadsrv.com/3721.js'></script>`
//   }
// ];


import { AdFormat, AdSize, DeviceType, StayOnAdSize, SliderAdSize, IntAdSize, IntAdTags, SliderAdTags, StayOnAdTags } from '../types/AdFormat';

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
        previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Full-screen mobile game advertisement'
      },
      {
        id: 'int-2',
        title: 'Megasis News',
        siteUrl: 'https://preview.colorlib.com/theme/megasis/post_details.html',
        previewImage: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Shopping app promotional interstitial'
      },
      {
        id: 'int-3',
        title: 'The Guardian',
        siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
        previewImage: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'App installation promotional ad'
      },
      {
        id: 'int-4',
        title: 'Meranda',
        siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
        previewImage: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
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
        previewImage: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Sliding banner from bottom edge'
      },
      {
        id: 'slider-2',
        title: 'TMSRV Test Page',
        siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
        previewImage: 'https://images.pexels.com/photos/267371/pexels-photo-267371.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Sliding banner from side edge'
      },
      {
        id: 'slider-3',
        title: 'News Latest',
        siteUrl: 'https://preview.colorlib.com/theme/news/latest_news.html',
        previewImage: 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Sliding banner from top edge'
      },
      {
        id: 'slider-4',
        title: 'Meranda',
        siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
        previewImage: 'https://images.pexels.com/photos/267373/pexels-photo-267373.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
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
        previewImage: 'https://images.pexels.com/photos/267399/pexels-photo-267399.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Fixed banner at bottom of screen'
      },
      {
        id: 'stay-2',
        title: 'AZ News',
        siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
        previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Fixed banner at top of screen'
      },
      {
        id: 'stay-3',
        title: 'TMSRV Test Page',
        siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
        previewImage: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Floating ad in corner position'
      },
      {
        id: 'stay-4',
        title: 'Meranda',
        siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
        previewImage: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Fixed sidebar advertisement'
      }
    ]
  },
  {
    id: 'remnant',
    name: 'Remnant Ads',
    type: 'display',
    category: 'Display',
    description: 'Banner ads shown on dedicated ad slots on the webpage for maximum fill rate.',
    examples: [
      {
        id: 'remnant-1',
        title: 'AZ News',
        siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
        previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Remnant banner in sidebar slot'
      },
      {
        id: 'remnant-2',
        title: 'Megasis News',
        siteUrl: 'https://preview.colorlib.com/theme/megasis/post_details.html',
        previewImage: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Remnant banner under content'
      },
      {
        id: 'remnant-3',
        title: 'The Guardian',
        siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
        previewImage: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Remnant leaderboard placement'
      },
      {
        id: 'remnant-4',
        title: 'Meranda',
        siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
        previewImage: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Remnant half-page banner'
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
        previewImage: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Video ad embedded in article'
      },
      {
        id: 'inread-2',
        title: 'The Guardian',
        siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
        previewImage: 'https://images.pexels.com/photos/3945317/pexels-photo-3945317.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Video player within news content'
      },
      {
        id: 'inread-3',
        title: 'AZ News',
        siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
        previewImage: 'https://images.pexels.com/photos/3945319/pexels-photo-3945319.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Video ad in blog post'
      },
      {
        id: 'inread-4',
        title: 'Meranda',
        siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
        previewImage: 'https://images.pexels.com/photos/3945321/pexels-photo-3945321.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
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
        previewImage: 'https://images.pexels.com/photos/3945323/pexels-photo-3945323.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Video that floats to corner'
      },
      {
        id: 'floating-2',
        title: 'Engadget',
        siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
        previewImage: 'https://images.pexels.com/photos/3945325/pexels-photo-3945325.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Video player that sticks while scrolling'
      },
      {
        id: 'floating-3',
        title: 'Wired',
        siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
        previewImage: 'https://images.pexels.com/photos/3945337/pexels-photo-3945337.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Video that minimizes when scrolled'
      },
      {
        id: 'floating-4',
        title: 'TechRadar',
        siteUrl: 'https://preview.colorlib.com/theme/meranda/blog-single.html',
        previewImage: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Picture-in-picture video ad'
      }
    ]
  },
  // {
  //   id: 'sidebar',
  //   name: 'Sidebar',
  //   type: 'video',
  //   category: 'Video',
  //   description: 'Video ad placed in sidebar area',
  //   examples: [
  //     {
  //       id: 'sidebar-1',
  //       title: 'AZ News',
  //       siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
  //       previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
  //       description: 'Video ad in right sidebar'
  //     },
  //     {
  //       id: 'sidebar-2',
  //       title: 'The Guardian',
  //       siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
  //       previewImage: 'https://images.pexels.com/photos/3945333/pexels-photo-3945333.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
  //       description: 'Video ad in left sidebar'
  //     },
  //     {
  //       id: 'sidebar-3',
  //       title: 'TMSRV Test Page',
  //       siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
  //       previewImage: 'https://images.pexels.com/photos/267371/pexels-photo-267371.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
  //       description: 'Video banner in sidebar'
  //     },
  //     {
  //       id: 'sidebar-4',
  //       title: 'News Latest',
  //       siteUrl: 'https://preview.colorlib.com/theme/news/latest_news.html',
  //       previewImage: 'https://images.pexels.com/photos/3945337/pexels-photo-3945337.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
  //       description: 'Video unit in sidebar area'
  //     }
  //   ]
  // },
  {
    id: 'hybrid-video',
    name: 'Hybrid Video',
    type: 'video',
    category: 'Video',
    description: 'Hybrid video format where when the player is out of view, it loads high-impact creative formats.',
    examples: [
      {
        id: 'hybrid-1',
        title: 'AZ News',
        siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
        previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Hybrid video ad in high-impact creative formats'
      },
      {
        id: 'hybrid-2',
        title: 'The Guardian',
        siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
        previewImage: 'https://images.pexels.com/photos/3945333/pexels-photo-3945333.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Hybrid video player in high-impact creative formats'
      },
      {
        id: 'hybrid-3',
        title: 'TMSRV Test Page',
        siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
        previewImage: 'https://images.pexels.com/photos/267371/pexels-photo-267371.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Hybrid video load when there is no ad'
      },
      {
        id: 'hybrid-4',
        title: 'News Latest',
        siteUrl: 'https://preview.colorlib.com/theme/news/latest_news.html',
        previewImage: 'https://images.pexels.com/photos/3945337/pexels-photo-3945337.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Hybrid video unit in hybrid area'
      }
    ]
  },
  {
    id: 'ribbon-player',
    name: 'Ribbon Player',
    type: 'video',
    category: 'Video',
    description: 'Ribbon-style video player that elegantly slides into view, offering premium video advertising with minimal disruption.',
    examples: [
      {
        id: 'ribbon-1',
        title: 'AZ News',
        siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
        previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Ribbon player ad in high-impact creative formats'
      },
      {
        id: 'ribbon-2',
        title: 'The Guardian',
        siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
        previewImage: 'https://images.pexels.com/photos/3945333/pexels-photo-3945333.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Ribbon player in high-impact creative formats'
      },
      {
        id: 'ribbon-3',
        title: 'TMSRV Test Page',
        siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
        previewImage: 'https://images.pexels.com/photos/267371/pexels-photo-267371.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Ribbon player load when there is no ad'
      },
      {
        id: 'ribbon-4',
        title: 'News Latest',
        siteUrl: 'https://preview.colorlib.com/theme/news/latest_news.html',
        previewImage: 'https://images.pexels.com/photos/3945337/pexels-photo-3945337.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        description: 'Ribbon player unit in ribbon area'
      }
    ]
  },
  // {
  //   id: 'rewarded-ad',
  //   name: 'Rewarded Ad',
  //   type: 'video',
  //   category: 'Video',
  //   description: 'Rewarded video ads that offer incentives for viewing, creating a win-win advertising experience.',
  //   examples: [
  //     {
  //       id: 'rewarded-1',
  //       title: 'AZ News',
  //       siteUrl: 'https://preview.colorlib.com/theme/aznews/latest_news.html',
  //       previewImage: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
  //       description: 'Rewarded ad in high-impact creative formats'
  //     },
  //     {
  //       id: 'rewarded-2',
  //       title: 'The Guardian',
  //       siteUrl: 'https://preview.colorlib.com/theme/newspaper/',
  //       previewImage: 'https://images.pexels.com/photos/3945333/pexels-photo-3945333.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
  //       description: 'Rewarded ad in high-impact creative formats'
  //     },
  //     {
  //       id: 'rewarded-3',
  //       title: 'TMSRV Test Page',
  //       siteUrl: 'https://assets.bidsxchange.com/new_videojs/bx-player-pras.html',
  //       previewImage: 'https://images.pexels.com/photos/267371/pexels-photo-267371.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
  //       description: 'Rewarded ad load when there is no ad'
  //     },
  //     {
  //       id: 'rewarded-4',
  //       title: 'News Latest',
  //       siteUrl: 'https://preview.colorlib.com/theme/news/latest_news.html',
  //       previewImage: 'https://images.pexels.com/photos/3945337/pexels-photo-3945337.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
  //       description: 'Rewarded ad unit in ribbon area'
  //     }
  //   ]
  // }
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
  { width: 320, height: 480, label: 'Desktop Size', type: 'medium' },
  { width: 300, height: 600, label: 'Mobile Banner', type: 'medium' },
  { width: 360, height: 480, label: 'Mobile Banner', type: 'medium' },
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
    label: '320x480', tag: `<div id='tmsrv-9400'>
	<script src='https://srv-qa.tmadsrv.com/9400.js'></script>
	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
		<script>
		window.tmsrv=window.tmsrv || {cmd: []};
		window.tmsrv.cmd.push(function(adObj) {
			adObj.AdSlot('tmsrv-9400');
			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9400/TPMS-Gallery-test-Interstatial-320x480');
			adObj.CacheBuster('%%CACHEBUSTER%%');
			adObj.UserConsent('0');
			adObj.Domain('test06/11.com');
			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
			adObj.ViewURL('%%VIEW_URL_UNESC%%');
			adObj.Execute();
		});
	</script>
</div>`  },
  {
    label: '300x250', tag: `<div id='tmsrv-9414'>
    <script src='https://srv-qa.tmadsrv.com/9414.js'></script>
    <script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
        <script>
        window.tmsrv=window.tmsrv || {cmd: []};
        window.tmsrv.cmd.push(function(adObj) {
            adObj.AdSlot('tmsrv-9414');
            adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9414/TPMS-Gallery-test-INT-300x250');
            adObj.CacheBuster('%%CACHEBUSTER%%');
            adObj.UserConsent('0');
            adObj.Domain('test06/11.com');
            adObj.ClickUrl('%%CLICK_URL_UNESC%%');
            adObj.ViewURL('%%VIEW_URL_UNESC%%');
            adObj.Execute();
        });
    </script>
</div>`},

  {
    label: '300x600', tag: `<div id='tmsrv-9411'>
	<script src='https://srv-qa.tmadsrv.com/9411.js'></script>
	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
		<script>
		window.tmsrv=window.tmsrv || {cmd: []};
		window.tmsrv.cmd.push(function(adObj) {
			adObj.AdSlot('tmsrv-9411');
			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9411/TPMS-Gallery-test-Interstatial-300x600');
			adObj.CacheBuster('%%CACHEBUSTER%%');
			adObj.UserConsent('0');
			adObj.Domain('test06/11.com');
			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
			adObj.ViewURL('%%VIEW_URL_UNESC%%');
			adObj.Execute();
		});
	</script>
</div>`},
  {
    label: '360x480', tag: `<div id='tmsrv-8759'>
    <script src='https://srv-qa.tmadsrv.com/8759.js'></script>
    <script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
      <script>
      window.tmsrv=window.tmsrv || {cmd: []};
      window.tmsrv.cmd.push(function(adObj) {
        adObj.AdSlot('tmsrv-8759');
        adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu8759/Demo-test-INT-360x480');
        adObj.CacheBuster('%%CACHEBUSTER%%');
        adObj.UserConsent('0');
        adObj.Domain('test06/11.com');
        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
        adObj.ViewURL('%%VIEW_URL_UNESC%%');
        adObj.Execute();
      });
    </script>
  </div>` },
];

export const stayOnAdTags: StayOnAdTags[] = [
  {
    label: '728x90', device: 'Desktop', tag: `<div id='tmsrv-9405'>
	<script src='https://srv-qa.tmadsrv.com/9405.js'></script>
	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
		<script>
		window.tmsrv=window.tmsrv || {cmd: []};
		window.tmsrv.cmd.push(function(adObj) {
			adObj.AdSlot('tmsrv-9405');
			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9405/TPMS-Gallery-test-stayon-728x90');
			adObj.CacheBuster('%%CACHEBUSTER%%');
			adObj.UserConsent('0');
			adObj.Domain('test06/11.com');
			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
			adObj.ViewURL('%%VIEW_URL_UNESC%%');
			adObj.Execute();
		});
	</script>
</div>` },
  {
    label: '970x90', device: 'Desktop', tag: `<div id='tmsrv-9406'>
	<script src='https://srv-qa.tmadsrv.com/9406.js'></script>
	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
		<script>
		window.tmsrv=window.tmsrv || {cmd: []};
		window.tmsrv.cmd.push(function(adObj) {
			adObj.AdSlot('tmsrv-9406');
			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9406/TPMS-Gallery-test-stayon-970x90');
			adObj.CacheBuster('%%CACHEBUSTER%%');
			adObj.UserConsent('0');
			adObj.Domain('test06/11.com');
			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
			adObj.ViewURL('%%VIEW_URL_UNESC%%');
			adObj.Execute();
		});
	</script>
</div>` },
  {
    label: '300x250', device: 'Desktop', tag: `<div id='tmsrv-9407'>
	<script src='https://srv-qa.tmadsrv.com/9407.js'></script>
	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
		<script>
		window.tmsrv=window.tmsrv || {cmd: []};
		window.tmsrv.cmd.push(function(adObj) {
			adObj.AdSlot('tmsrv-9407');
			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9407/TPMS-Gallery-test-stayon-300x250');
			adObj.CacheBuster('%%CACHEBUSTER%%');
			adObj.UserConsent('0');
			adObj.Domain('test06/11.com');
			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
			adObj.ViewURL('%%VIEW_URL_UNESC%%');
			adObj.Execute();
		});
	</script>
</div>` },
  {
    label: '320x50', device: 'Desktop', tag: `<div id='tmsrv-8765'>
    <script src='https://srv-qa.tmadsrv.com/8765.js'></script>
    <script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
      <script>
      window.tmsrv=window.tmsrv || {cmd: []};
      window.tmsrv.cmd.push(function(adObj) {
        adObj.AdSlot('tmsrv-8765');
        adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu8765/Demo-test-SO-320x50');
        adObj.CacheBuster('%%CACHEBUSTER%%');
        adObj.UserConsent('0');
        adObj.Domain('test06/11.com');
        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
        adObj.ViewURL('%%VIEW_URL_UNESC%%');
        adObj.Execute();
      });
    </script>
  </div>` },
  {
    label: '320x100', device: 'Desktop', tag: `<div id='tmsrv-8766'>
    <script src='https://srv-qa.tmadsrv.com/8766.js'></script>
    <script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
        <script>
        window.tmsrv=window.tmsrv || {cmd: []};
        window.tmsrv.cmd.push(function(adObj) {
            adObj.AdSlot('tmsrv-8766');
            adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu8766/Demo-test-SO-320x100');
            adObj.CacheBuster('%%CACHEBUSTER%%');
            adObj.UserConsent('0');
            adObj.Domain('test06/11.com');
            adObj.ClickUrl('%%CLICK_URL_UNESC%%');
            adObj.ViewURL('%%VIEW_URL_UNESC%%');
            adObj.Execute();
        });
    </script>
</div>` },
  {
    label: '300x250', device: 'Desktop', tag: `<div id='tmsrv-8764'>
    <script src='https://srv-qa.tmadsrv.com/8764.js'></script>
    <script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
      <script>
      window.tmsrv=window.tmsrv || {cmd: []};
      window.tmsrv.cmd.push(function(adObj) {
        adObj.AdSlot('tmsrv-8764');
        adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu8764/Demo-test-SO-300x250');
        adObj.CacheBuster('%%CACHEBUSTER%%');
        adObj.UserConsent('0');
        adObj.Domain('test06/11.com');
        adObj.ClickUrl('%%CLICK_URL_UNESC%%');
        adObj.ViewURL('%%VIEW_URL_UNESC%%');
        adObj.Execute();
      });
    </script>
  </div>` },
];

export const sliderAdTags: SliderAdTags[] = [
  {
    label: '300x250', tag: `<div id='tmsrv-9403'>
	<script src='https://srv-qa.tmadsrv.com/9403.js'></script>
	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
		<script>
		window.tmsrv=window.tmsrv || {cmd: []};
		window.tmsrv.cmd.push(function(adObj) {
			adObj.AdSlot('tmsrv-9403');
			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9403/TPMS-Gallery-test-Slider-300x250');
			adObj.CacheBuster('%%CACHEBUSTER%%');
			adObj.UserConsent('0');
			adObj.Domain('test06/11.com');
			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
			adObj.ViewURL('%%VIEW_URL_UNESC%%');
			adObj.Execute();
		});
	</script>
</div>` },
  {
    label: '300x600', tag: `<div id='tmsrv-9402'>
	<script src='https://srv-qa.tmadsrv.com/9402.js'></script>
	<script async src='https://dsrv.tmadsrv.com/tmCore.js'></script>
		<script>
		window.tmsrv=window.tmsrv || {cmd: []};
		window.tmsrv.cmd.push(function(adObj) {
			adObj.AdSlot('tmsrv-9402');
			adObj.Meta('/tmsrvptr1115/tmsrvplr2657/tmsrvadu9402/TPMS-Gallery-test-Slider-300x600');
			adObj.CacheBuster('%%CACHEBUSTER%%');
			adObj.UserConsent('0');
			adObj.Domain('test06/11.com');
			adObj.ClickUrl('%%CLICK_URL_UNESC%%');
			adObj.ViewURL('%%VIEW_URL_UNESC%%');
			adObj.Execute();
		});
	</script>
</div>` }
];


export const remnantAdTags: { label: string; tag: string }[] = [
  {
    label: '300x250', tag: `<script  id='hads-3765' src='https://hads.tmadsrv.com/3765.js'></script>`
  },
  {
    label: '728x90', tag: `<script  id='hads-3719' src='https://hads.tmadsrv.com/3719.js'></script>`
  },
  {
    label: '300x600', tag: `<script  id='hads-3769' src='https://hads.tmadsrv.com/3769.js'></script>`
  },
  // {
  //   label: '320x50', tag: `<script  id='fsrv-3572' src='https://test-fsrv.bidsxchange.com/3572.js'></script>`
  // },
  // {
  //   label: '320x100', tag: `<script  id='hads-3721' src='https://hads.tmadsrv.com/3721.js'></script>`
  // }
];
