import type { LayoutConfig } from "@/types"

// 默认布局配置
export const defaultLayoutConfig: LayoutConfig = {
  pageLayout: {
    type: 'sidebar',
    sidebar: {
      width: 280,
      collapsedWidth: 80,
      position: 'left',
      behavior: 'fixed'
    },
    header: {
      height: 64,
      sticky: true,
      transparent: false
    },
    footer: {
      height: 60,
      sticky: false,
      visible: true
    },
    content: {
      maxWidth: 1200,
      padding: 24,
      margin: 'auto'
    }
  },
  gridSystem: {
    columns: 12,
    gutter: 24,
    margin: 16,
    breakpoints: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      '2xl': 1400
    }
  },
  containers: {
    sm: 540,
    md: 720,
    lg: 960,
    xl: 1140,
    '2xl': 1320,
    fluid: false
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64
  }
}

// 布局预设配置
export const layoutPresets = {
  default: defaultLayoutConfig,
  compact: {
    ...defaultLayoutConfig,
    pageLayout: {
      ...defaultLayoutConfig.pageLayout,
      sidebar: {
        ...defaultLayoutConfig.pageLayout.sidebar,
        width: 240,
        collapsedWidth: 60
      },
      header: {
        ...defaultLayoutConfig.pageLayout.header,
        height: 56
      },
      content: {
        ...defaultLayoutConfig.pageLayout.content,
        padding: 16
      }
    },
    spacing: {
      xs: 2,
      sm: 4,
      md: 8,
      lg: 16,
      xl: 24,
      '2xl': 32,
      '3xl': 48
    }
  },
  spacious: {
    ...defaultLayoutConfig,
    pageLayout: {
      ...defaultLayoutConfig.pageLayout,
      sidebar: {
        ...defaultLayoutConfig.pageLayout.sidebar,
        width: 320,
        collapsedWidth: 100
      },
      header: {
        ...defaultLayoutConfig.pageLayout.header,
        height: 80
      },
      content: {
        ...defaultLayoutConfig.pageLayout.content,
        padding: 32,
        maxWidth: 1400
      }
    },
    spacing: {
      xs: 8,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 48,
      '2xl': 64,
      '3xl': 96
    }
  },
  topbar: {
    ...defaultLayoutConfig,
    pageLayout: {
      type: 'topbar',
      sidebar: {
        width: 0,
        collapsedWidth: 0,
        position: 'left',
        behavior: 'static'
      },
      header: {
        height: 64,
        sticky: true,
        transparent: false
      },
      footer: {
        height: 60,
        sticky: false,
        visible: true
      },
      content: {
        maxWidth: 1200,
        padding: 24,
        margin: 'auto'
      }
    }
  },
  fullscreen: {
    ...defaultLayoutConfig,
    pageLayout: {
      type: 'fullscreen',
      sidebar: {
        width: 0,
        collapsedWidth: 0,
        position: 'left',
        behavior: 'static'
      },
      header: {
        height: 0,
        sticky: false,
        transparent: true
      },
      footer: {
        height: 0,
        sticky: false,
        visible: false
      },
      content: {
        maxWidth: 0,
        padding: 0,
        margin: 'none'
      }
    }
  },
  split: {
    ...defaultLayoutConfig,
    pageLayout: {
      type: 'split',
      sidebar: {
        width: 320,
        collapsedWidth: 80,
        position: 'left',
        behavior: 'fixed'
      },
      header: {
        height: 64,
        sticky: true,
        transparent: false
      },
      footer: {
        height: 60,
        sticky: false,
        visible: true
      },
      content: {
        maxWidth: 0,
        padding: 24,
        margin: 'none'
      }
    }
  }
}
