// this example has been taken from aphrodite: https://github.com/Khan/aphrodite

import React from 'react';
import cssbeautify from 'cssbeautify';
import { StyleSheet } from '../../';

const styles = StyleSheet.create({
    red: {
        color: "red",
    },

    blue: {
        color: "blue",
    },

    hover: {
        "&:hover": {
            color: "red",
        }
    },

    hoverBlue: {
        "&:hover": {
            color: "blue",
        }
    },

    small: {
        "@media (max-width: 600px)": {
            color: "red",
        }
    },

    evenSmaller: {
        "@media (max-width: 400px)": {
            color: "blue",
        }
    },

    smallAndHover: {
        "&:hover": {
            color: "green",
        },
        "@media (max-width: 600px)": {
            color: "red",
            "&:hover": {
                color: "blue",
            }
        },
    },

    returnOfSmallAndHover: {
        "&:hover": {
            color: "red",
        },
        "@media (max-width: 600px)": {
            color: "blue",
            "&:hover": {
                color: "green",
            }
        },
    },

    pseudoSelectors: {
        "&:hover": {
            color: "red",
        },
        "&:active": {
            color: "blue",
        }
    },

    flexCenter: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 200,
        height: 200,
        outline: "1px solid black",
    },

    flexInner: {
        display: "inline-block",
        width: 100,
        textAlign: "justify",
        textAlignLast: "justify",
    },
});

const styles2 = StyleSheet.create({
    red: {
        color: "green",
    },
});


export default class App extends React.Component {

    constructor(props, context) {
        super(props, context)
        this. state = { timer: false }
    }

    componentDidMount() {
        setInterval(() => this.setState({ timer: !this.state.timer }), 500)
    }

    render() {
      const stylesRenderer = this.props.stylesRenderer;
      const r = stylesRenderer.renderStyles;
      return (
        <div>
          <div className={r(styles.red)}>This should be red</div>
          <div className={r(styles.hover)}>This should turn red on hover</div>
          <div className={r(styles.small)}>This should turn red when the browser is less than 600px width</div>
          <div className={r(styles.red, styles.blue)}>This should be blue</div>
          <div className={r(styles.blue, styles.red)}>This should be red</div>
          <div className={r(styles.hover, styles.blue)}>This should be blue but turn red on hover</div>
          <div className={r(styles.small, styles.blue)}>This should be blue but turn red when less than 600px width</div>
          <div className={r(styles.hover, styles.hoverBlue)}>This should turn blue on hover</div>
          <div className={r(styles.small, styles.evenSmaller)}>This should turn red when less than 600px and blue when less than 400px</div>
          <div className={r(styles.smallAndHover)}>This should be red when small, green when hovered, and blue when both.</div>
          <div className={r(styles.smallAndHover, styles.returnOfSmallAndHover)}>This should be blue when small, red when hovered, and green when both.</div>
          <div className={r(styles.red, styles2.red)}>This should be green.</div>
          <div className={r(this.state.timer ? styles.red : styles.blue)}>This should alternate between red and blue every second.</div>
          <a href="javascript: void 0" className={r(styles.pseudoSelectors)}>This should turn red on hover and ???? (blue or red) on active</a>
          <div className={r(styles.flexCenter)}>
              <div className={r(styles.flexInner)}>This should be centered inside the outer box, even in IE 10.</div>
          </div>
          <div>
              Rendered Styles : 
              <pre>{cssbeautify(stylesRenderer.renderToString())}</pre>
          </div>
        </div>
      );
    }
}
