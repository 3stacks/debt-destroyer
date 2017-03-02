# Deloitte Digital Portfolio Website

## Getting Started

- run `npm install`
- run `npm start` for development
- run `npm run build` for build only


## Folder Structure

```
.
├── dist                         # Build file location
└── src                          # Source file location
    ├── html                     # Html file location
    ├── img                      # Image file location (including svg)
    ├── js                       # JS file location
    │   ├── components           # vue component file location
    │   └── index.js             # main js file
    └── sass                     # sass directory
        ├── components           # all styles corresponding to a component
        ├── elements             # all element specific styles
        ├── helpers              # mixins and settings
        └── style.scss           # main sass stylesheet
```

## Some Details

- Made using Chrome Latest
- Tested on IE11 using BrowserStack
- Tested on Nexus 5X
- Tested on iPad Mini

## Project Tagline

I didn't add the cursive font to the tagline in the interest of time. I wouldn't load a webfont just for this, 
I would make that a svg image instead.

## The slider...

In the interest of saving time, I just chucked jQuery and unslider on the page. Given more
time to work on this project I would have added a vanilla js version maybe packaged in vue.

I have a package here ... 
[https://www.npmjs.com/package/@lukeboyle/lazy-slider](https://www.npmjs.com/package/@lukeboyle/lazy-slider) 
that would have fit nicely.

## Accessibility

Wherever possible I've tried to make the page more accessible. For example:

### Semantic Elements

Using `<figure>` and `<figcaption>` make it easier on screen readers

### The Modal

I've added `aria` tags for screen readers and made it fully keyboard accessible by 
auto-focusing and having escape button to close.

### The issues

The main issue I am seeing for accessibility is the slider at the top of the page. 
I would personally ditch this in favour of a static feature image for the top. The 
fast moving slider makes it difficult for people with learning disabilities to digest 
the content.

In terms of contrast, the copyright text fails AA and AAA WCAG standards for contrast.
Making the copyright text a lighter gray would solve the issue (#999 for example).

## Fancy Parts

### The images

The psd had a simple plus button on the corner, so for some extra flavour I added the plus as a cursor
style for that section. The v-full-src directive is what handles opening the modal and loading in content.

The modal gets the full src and the caption from the alt tag

Also, they're picture elements, so no media queries with bg images required.
 
## Known Issues

- Vertically tall images will overflow the screen when a modal opens
- Hiding the project selection on mobile because it looks like part of the UI of the larger site 
(may require more design direction)
- The slider is hidden on mobile because it captures too much of the screen and looks out of place on mobile 
(especially landscape)
- The modal doesn't currently allow content to grow to natural size
- Custom cursors are not supported on IE11, this will need to be rectified in V2.
- The scripts should be bundled and minified, but I left the as script tags for extra visibility