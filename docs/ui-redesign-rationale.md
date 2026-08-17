# Interface redesign rationale

The revised interface will move away from the current flat paper-card repetition toward a **quiet studio desk** system: a cool, low-luminance workspace in dark mode and a restrained, warm archival-paper workspace in light mode. The layout will reserve strong contrast and color for the current task, status, and primary action, while supporting information recedes into tonal layers.

| Design decision | Applied approach |
|---|---|
| Dark-surface depth | Use a blue-black base, subtly lighter elevated panels, fine hairline borders, and deeper shadows instead of pure black, white glow, or large saturated gradients. |
| Text hierarchy | Use softened off-white for body copy, a brighter ink tone for headings, and a muted cool-gray for supporting metadata. |
| Accent restraint | Use one coral action accent and one muted sky status accent, limited to actions, active navigation, and compact indicators. |
| Workspace density | Group content by task—application context, review state, and documents—rather than giving every panel the same visual weight. |
| Motion and focus | Use short opacity/transform transitions only, clear keyboard focus rings, and avoid motion that changes the layout. |

The direction follows platform guidance to design dark interfaces as a dedicated semantic palette rather than an inversion, retain sufficient contrast, and distinguish base from elevated surfaces.[1] It also applies dark-theme guidance to use dark gray rather than pure black, lighter elevated surfaces, and limited/desaturated accents.[2] The cool dark cast and softened contrast are intentional, because dark interfaces benefit from distinct tonal depth instead of high-contrast white-on-black treatment.[3]

## References

[1]: https://developer.apple.com/design/human-interface-guidelines/dark-mode "Apple Human Interface Guidelines: Dark Mode"
[2]: https://m2.material.io/design/color/dark-theme.html "Material Design: Dark theme"
[3]: https://www.jamesrobinson.io/post/a-guide-to-dark-mode-design "A guide to dark mode design — James Robinson"
