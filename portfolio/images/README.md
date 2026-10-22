# Image originals

Drop the full-size original here, in the folder for its kind, and run `npm run images` from `portfolio/`. The script writes the resized WebP files to `public/`. On a pull request, the Images workflow runs it for you and commits the result.

| Folder         | Becomes                                                                                           | Used by                                                          |
| :------------- | :------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------- |
| `shots/`       | `public/shots/<name>.webp` (960 px) and `<name>-480.webp`                                         | Project screenshots (`shot` in `src/content/data/projects.json`) |
| `credentials/` | `public/credentials/<name>.webp` (1100 px), `thumb/<name>.webp` (560) and `thumb/<name>-360.webp` | Certificates (`img` in `credGroups`)                             |
| `migozz/`      | `public/migozz/<name>.webp` (780 px)                                                              | Phone screenshots on the MIGOZZ case study page                  |
| `portrait/`    | `public/portrait/<name>.webp` (square, up to 600 px)                                              | Portrait in the practice section (`Practice.tsx`)                |

PNG, JPG, WebP and TIFF are accepted. Use lowercase names with hyphens (`curso-testing.jpg`): the name becomes the file name the content points to.

Size budgets live in `tests/assets.test.ts`; the test fails if an output is too heavy.
