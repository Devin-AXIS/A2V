import type { ComponentStyleConfig } from "@/types"

// 默认组件样式配置
export const defaultComponentStyleConfig: ComponentStyleConfig = {
  button: {
    base: {
      padding: "0.5rem 1rem",
      borderRadius: "0.375rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      transition: "all 0.2s ease-in-out",
      cursor: "pointer",
      border: "1px solid transparent",
      outline: "none"
    },
    variants: {
      primary: {
        backgroundColor: "#3b82f6",
        color: "#ffffff",
        borderColor: "#3b82f6",
        hover: {
          backgroundColor: "#2563eb",
          color: "#ffffff",
          borderColor: "#2563eb"
        },
        active: {
          backgroundColor: "#1d4ed8",
          color: "#ffffff",
          borderColor: "#1d4ed8"
        },
        disabled: {
          backgroundColor: "#9ca3af",
          color: "#6b7280",
          borderColor: "#9ca3af",
          cursor: "not-allowed"
        }
      },
      secondary: {
        backgroundColor: "#6b7280",
        color: "#ffffff",
        borderColor: "#6b7280",
        hover: {
          backgroundColor: "#4b5563",
          color: "#ffffff",
          borderColor: "#4b5563"
        },
        active: {
          backgroundColor: "#374151",
          color: "#ffffff",
          borderColor: "#374151"
        },
        disabled: {
          backgroundColor: "#d1d5db",
          color: "#9ca3af",
          borderColor: "#d1d5db",
          cursor: "not-allowed"
        }
      },
      outline: {
        backgroundColor: "transparent",
        color: "#3b82f6",
        borderColor: "#3b82f6",
        hover: {
          backgroundColor: "#3b82f6",
          color: "#ffffff",
          borderColor: "#3b82f6"
        },
        active: {
          backgroundColor: "#2563eb",
          color: "#ffffff",
          borderColor: "#2563eb"
        },
        disabled: {
          backgroundColor: "transparent",
          color: "#9ca3af",
          borderColor: "#d1d5db",
          cursor: "not-allowed"
        }
      },
      ghost: {
        backgroundColor: "transparent",
        color: "#3b82f6",
        borderColor: "transparent",
        hover: {
          backgroundColor: "#eff6ff",
          color: "#3b82f6",
          borderColor: "transparent"
        },
        active: {
          backgroundColor: "#dbeafe",
          color: "#2563eb",
          borderColor: "transparent"
        },
        disabled: {
          backgroundColor: "transparent",
          color: "#9ca3af",
          borderColor: "transparent",
          cursor: "not-allowed"
        }
      }
    },
    sizes: {
      sm: {
        padding: "0.375rem 0.75rem",
        fontSize: "0.75rem",
        borderRadius: "0.25rem"
      },
      md: {
        padding: "0.5rem 1rem",
        fontSize: "0.875rem",
        borderRadius: "0.375rem"
      },
      lg: {
        padding: "0.75rem 1.5rem",
        fontSize: "1rem",
        borderRadius: "0.5rem"
      }
    }
  },
  input: {
    base: {
      padding: "0.5rem 0.75rem",
      borderRadius: "0.375rem",
      fontSize: "0.875rem",
      border: "1px solid #d1d5db",
      outline: "none",
      transition: "all 0.2s ease-in-out",
      backgroundColor: "#ffffff",
      color: "#111827"
    },
    states: {
      focus: {
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
      },
      error: {
        borderColor: "#ef4444",
        backgroundColor: "#fef2f2"
      },
      disabled: {
        backgroundColor: "#f9fafb",
        color: "#6b7280",
        cursor: "not-allowed"
      }
    },
    sizes: {
      sm: {
        padding: "0.375rem 0.5rem",
        fontSize: "0.75rem",
        borderRadius: "0.25rem"
      },
      md: {
        padding: "0.5rem 0.75rem",
        fontSize: "0.875rem",
        borderRadius: "0.375rem"
      },
      lg: {
        padding: "0.75rem 1rem",
        fontSize: "1rem",
        borderRadius: "0.5rem"
      }
    }
  },
  card: {
    base: {
      backgroundColor: "#ffffff",
      borderRadius: "0.5rem",
      border: "1px solid #e5e7eb",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      padding: "1.5rem",
      transition: "all 0.2s ease-in-out"
    },
    variants: {
      default: {
        backgroundColor: "#ffffff",
        borderColor: "#e5e7eb",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
      },
      elevated: {
        backgroundColor: "#ffffff",
        borderColor: "transparent",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      },
      outlined: {
        backgroundColor: "transparent",
        borderColor: "#e5e7eb",
        boxShadow: "none"
      },
      ghost: {
        backgroundColor: "transparent",
        borderColor: "transparent",
        boxShadow: "none"
      }
    },
    sizes: {
      sm: {
        padding: "1rem",
        borderRadius: "0.375rem"
      },
      md: {
        padding: "1.5rem",
        borderRadius: "0.5rem"
      },
      lg: {
        padding: "2rem",
        borderRadius: "0.75rem"
      }
    }
  },
  navigation: {
    base: {
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #e5e7eb",
      padding: "0 1rem",
      transition: "all 0.2s ease-in-out"
    },
    item: {
      base: {
        padding: "0.75rem 1rem",
        color: "#6b7280",
        textDecoration: "none",
        transition: "all 0.2s ease-in-out",
        borderRadius: "0.375rem"
      },
      states: {
        hover: {
          backgroundColor: "#f3f4f6",
          color: "#374151"
        },
        active: {
          backgroundColor: "#eff6ff",
          color: "#3b82f6",
          fontWeight: "600"
        },
        disabled: {
          color: "#9ca3af",
          cursor: "not-allowed"
        }
      }
    },
    dropdown: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      padding: "0.5rem"
    }
  },
  tag: {
    base: {
      padding: "0.25rem 0.5rem",
      borderRadius: "0.25rem",
      fontSize: "0.75rem",
      fontWeight: "500",
      border: "1px solid transparent",
      transition: "all 0.2s ease-in-out"
    },
    variants: {
      default: {
        backgroundColor: "#f3f4f6",
        color: "#374151",
        borderColor: "#d1d5db"
      },
      primary: {
        backgroundColor: "#eff6ff",
        color: "#3b82f6",
        borderColor: "#bfdbfe"
      },
      success: {
        backgroundColor: "#f0fdf4",
        color: "#16a34a",
        borderColor: "#bbf7d0"
      },
      warning: {
        backgroundColor: "#fffbeb",
        color: "#d97706",
        borderColor: "#fed7aa"
      },
      error: {
        backgroundColor: "#fef2f2",
        color: "#dc2626",
        borderColor: "#fecaca"
      }
    },
    sizes: {
      sm: {
        padding: "0.125rem 0.375rem",
        fontSize: "0.625rem",
        borderRadius: "0.125rem"
      },
      md: {
        padding: "0.25rem 0.5rem",
        fontSize: "0.75rem",
        borderRadius: "0.25rem"
      },
      lg: {
        padding: "0.375rem 0.75rem",
        fontSize: "0.875rem",
        borderRadius: "0.375rem"
      }
    }
  }
}

// 组件样式预设配置
export const componentStylePresets = {
  default: defaultComponentStyleConfig,
  modern: {
    ...defaultComponentStyleConfig,
    button: {
      ...defaultComponentStyleConfig.button,
      base: {
        ...defaultComponentStyleConfig.button.base,
        borderRadius: "0.75rem",
        fontWeight: "600"
      },
      variants: {
        ...defaultComponentStyleConfig.button.variants,
        primary: {
          ...defaultComponentStyleConfig.button.variants.primary,
          backgroundColor: "#6366f1",
          borderColor: "#6366f1",
          hover: {
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            borderColor: "#4f46e5"
          }
        }
      }
    },
    card: {
      ...defaultComponentStyleConfig.card,
      base: {
        ...defaultComponentStyleConfig.card.base,
        borderRadius: "1rem",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }
    }
  },
  minimal: {
    ...defaultComponentStyleConfig,
    button: {
      ...defaultComponentStyleConfig.button,
      base: {
        ...defaultComponentStyleConfig.button.base,
        borderRadius: "0",
        border: "none",
        boxShadow: "none"
      }
    },
    input: {
      ...defaultComponentStyleConfig.input,
      base: {
        ...defaultComponentStyleConfig.input.base,
        borderRadius: "0",
        border: "none",
        borderBottom: "1px solid #d1d5db"
      }
    },
    card: {
      ...defaultComponentStyleConfig.card,
      base: {
        ...defaultComponentStyleConfig.card.base,
        borderRadius: "0",
        border: "none",
        boxShadow: "none"
      }
    }
  },
  colorful: {
    ...defaultComponentStyleConfig,
    button: {
      ...defaultComponentStyleConfig.button,
      variants: {
        primary: {
          backgroundColor: "#ec4899",
          color: "#ffffff",
          borderColor: "#ec4899",
          hover: {
            backgroundColor: "#db2777",
            color: "#ffffff",
            borderColor: "#db2777"
          },
          active: {
            backgroundColor: "#be185d",
            color: "#ffffff",
            borderColor: "#be185d"
          },
          disabled: {
            backgroundColor: "#fbcfe8",
            color: "#f9a8d4",
            borderColor: "#fbcfe8",
            cursor: "not-allowed"
          }
        },
        secondary: {
          backgroundColor: "#8b5cf6",
          color: "#ffffff",
          borderColor: "#8b5cf6",
          hover: {
            backgroundColor: "#7c3aed",
            color: "#ffffff",
            borderColor: "#7c3aed"
          },
          active: {
            backgroundColor: "#6d28d9",
            color: "#ffffff",
            borderColor: "#6d28d9"
          },
          disabled: {
            backgroundColor: "#ddd6fe",
            color: "#c4b5fd",
            borderColor: "#ddd6fe",
            cursor: "not-allowed"
          }
        }
      }
    },
    tag: {
      ...defaultComponentStyleConfig.tag,
      variants: {
        ...defaultComponentStyleConfig.tag.variants,
        primary: {
          backgroundColor: "#fdf2f8",
          color: "#ec4899",
          borderColor: "#fbcfe8"
        },
        success: {
          backgroundColor: "#f0fdf4",
          color: "#22c55e",
          borderColor: "#bbf7d0"
        },
        warning: {
          backgroundColor: "#fffbeb",
          color: "#f59e0b",
          borderColor: "#fed7aa"
        },
        error: {
          backgroundColor: "#fef2f2",
          color: "#ef4444",
          borderColor: "#fecaca"
        }
      }
    }
  }
}
