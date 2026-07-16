import { z } from "zod";
import { BaseTool } from "../utils/base-tool.js";

interface ThemeOptions {
  dark: string;
  light: string;
}

interface SVGLogo {
  id?: number;
  title: string;
  category: string | string[];
  route: string | ThemeOptions;
  wordmark?: string | ThemeOptions;
  brandUrl?: string;
  url: string;
}

const LOGO_TOOL_NAME = "logo_search";
const LOGO_TOOL_DESCRIPTION = `
Search and return logos in specified format (JSX, TSX, SVG).
Supports single and multiple logo searches with category filtering.
Can return logos in different themes (light/dark) if available.

When to use this tool:
1. When user types "/logo" command (e.g., "/logo GitHub")
2. When user asks to add a company logo that's not in the local project

Format options:
- TSX: Returns TypeScript React component
- JSX: Returns JavaScript React component
- SVG: Returns raw SVG markup
`;

export class LogoSearchTool extends BaseTool {
  name = LOGO_TOOL_NAME;
  description = LOGO_TOOL_DESCRIPTION;

  schema = z.object({
    queries: z
      .array(z.string())
      .describe("List of company names to search for logos."),
    format: z
      .enum(["JSX", "TSX", "SVG"])
      .describe("Output format for the logo."),
  });

  private async fetchLogos(query: string): Promise<SVGLogo[]> {
    const baseUrl = "https://api.svgl.app";
    const url = `${baseUrl}?search=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`SVGL API error: ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`[${LOGO_TOOL_NAME}] Error fetching logos for ${query}:`, error);
      return [];
    }
  }

  private async fetchSVGContent(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch SVG content: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error("Error fetching SVG content:", error);
      throw error;
    }
  }

  private async convertToFormat(
    svgContent: string,
    format: "JSX" | "TSX" | "SVG",
    componentName: string = "Icon"
  ): Promise<string> {
    if (format === "SVG") {
      return svgContent;
    }

    const jsxContent = svgContent
      .replace(/class=/g, "className=")
      .replace(/style="([^"]*)"/g, (_match: string, styles: string) => {
        const cssObject = styles
          .split(";")
          .filter(Boolean)
          .map((style: string) => {
            const [property, value] = style
              .split(":")
              .map((s: string) => s.trim());
            const camelProperty = property.replace(/-([a-z])/g, (g: string) =>
              g[1].toUpperCase()
            );
            return `${camelProperty}: "${value}"`;
          })
          .join(", ");
        return `style={{${cssObject}}}`;
      });

    const finalComponentName = componentName.endsWith("Icon")
      ? componentName
      : `${componentName}Icon`;
    return format === "TSX"
      ? `const ${finalComponentName}: React.FC = () => (${jsxContent})`
      : `function ${finalComponentName}() { return (${jsxContent}) }`;
  }

  async execute({ queries, format }: z.infer<typeof this.schema>) {
    try {
      const results = await Promise.all(
        queries.map(async (query) => {
          try {
            const logos = await this.fetchLogos(query);

            if (logos.length === 0) {
              return {
                query,
                success: false,
                message: `No logo found for: "${query}"`,
              };
            }

            const logo = logos[0];
            const svgUrl =
              typeof logo.route === "string" ? logo.route : logo.route.light;
            const svgContent = await this.fetchSVGContent(svgUrl);

            const formattedContent = await this.convertToFormat(
              svgContent,
              format,
              logo.title + "Icon"
            );

            return {
              query,
              success: true,
              content: `// ${logo.title} (${logo.url})\n${formattedContent}`,
            };
          } catch (error) {
            return {
              query,
              success: false,
              message:
                error instanceof Error ? error.message : "Unknown error",
            };
          }
        })
      );

      const successful = results.filter(
        (r): r is typeof r & { content: string } => r.success && "content" in r
      );
      const failed = results.filter((r) => !r.success);

      const foundIcons = successful.map((r) => {
        const title =
          r.content?.split("\n")[0].replace("// ", "").split(" (")[0] || "";
        const componentName =
          title
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join("")
            .replace(/[^a-zA-Z0-9]/g, "") + "Icon";

        return {
          icon: componentName,
          code: r.content?.split("\n").slice(1).join("\n") || "",
        };
      });

      const missingIcons = failed.map((f) => ({
        icon: f.query,
        alternatives: [
          "Search for SVG version on the official website",
          "Check other icon libraries (e.g., heroicons, lucide)",
          "Request SVG file from the user",
        ],
      }));

      const response = {
        icons: foundIcons,
        notFound: missingIcons,
        setup: [
          "1. Add these icons to your project:",
          foundIcons
            .map((c) => `   ${c.icon}.${format.toLowerCase()}`)
            .join("\n"),
          "2. Import and use like this:",
          "```tsx",
          "import { " +
            foundIcons.map((c) => c.icon).join(", ") +
            " } from '@/icons';",
          "```",
        ].join("\n"),
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error(`[${LOGO_TOOL_NAME}] Error:`, error);
      throw error;
    }
  }
}
