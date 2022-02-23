Navigation component contains all tabs in a group.

There are two types of navbar: horizontal and vertical.

### HNav

#### Props

```html
<h-nav :appearance="" :position="">...</h-nav>
```

##### appearance

- Optional
- Type: `string "tabs" | "pills"`
- Default: `"tabs"`

  - tabs

  ![hnav tabs](_media/hnav-tabs.png ':size=autox50')

  - pills

  ![hnav pills](_media/hnav-pills.png ':size=autox50')

You can also combine with tab's `rounded` prop.

![hnav pills](_media/hnav-pills-rounded.png ':size=autox50')

If you want to custom how tabs look like, you can use `style` or `class` props to override default CSS.

##### position

- Optional
- Type: `string "top" | "bottom"`
- Default: `"top"`

Set navbar **border** is above or below tab view. Don't be confused that it will set the position for tabs in the page. This library is designed for easy customization so where to place the elements is up to you.

### VNav

Similar to `HNav` but tabs are displayed vertically. `VNav` doesn't have any custom props. By default, `VNav` uses "pills" style.
