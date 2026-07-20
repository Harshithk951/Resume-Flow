# Template Quality Scorecard

- **Run ID:** 2026-07-20T08-23-56-637Z-ci
- **Created:** 2026-07-20T08:24:15.901Z
- **CI mode:** true
- **Overall pass:** NO

## Template Summary

| Template | Avg Overall | Pass Rate | Blocking Failures |
|----------|-------------|-----------|-------------------|
| ats_strict | 48 | 0% | finance-analyst/finance-analyst: PDF Compile Reliability; finance-analyst/finance-analyst: ATS Parse & Text Recovery; swe-mid/swe-bigtech: PDF Compile Reliability |
| modern_professional | 64 | 0% | finance-analyst/finance-analyst: ATS Parse & Text Recovery; swe-mid/swe-bigtech: ATS Parse & Text Recovery; swe-mid/swe-startup: ATS Parse & Text Recovery |
| modern_executive | 64 | 0% | finance-analyst/finance-analyst: ATS Parse & Text Recovery; swe-mid/swe-bigtech: ATS Parse & Text Recovery; swe-mid/swe-startup: ATS Parse & Text Recovery |
| tech_innovator | 64 | 0% | finance-analyst/finance-analyst: ATS Parse & Text Recovery; swe-mid/swe-bigtech: ATS Parse & Text Recovery; swe-mid/swe-startup: ATS Parse & Text Recovery |

## Combinations

### FAIL — `ats_strict` / finance-analyst / finance-analyst (overall 48)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: #, #, &, #, #, &, #, #, &, # |
| Content Impact (XYZ Bullets) | 92 | no | Conducted credit risk analysis on 40+ fixed-income instrumen…: Missing method/te |
| PDF Compile Reliability | 0 | no | pdflatex compilation failed |
| ATS Parse & Text Recovery | 0 | no | No PDF available for text extraction |
| Recruiter Scan / Visual Quality | 85 | no | PDF page count is 0, expected exactly 1 |
| LLM Shortlist Review | — | yes | NVIDIA_NIM_API_KEY not set — LLM review skipped |

### FAIL — `ats_strict` / swe-mid / swe-bigtech (overall 50)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: #, #, &, #, #, &, #, #, &, # |
| Content Impact (XYZ Bullets) | 100 | yes | — |
| PDF Compile Reliability | 0 | no | pdflatex compilation failed |
| ATS Parse & Text Recovery | 0 | no | No PDF available for text extraction |
| Recruiter Scan / Visual Quality | 85 | no | PDF page count is 0, expected exactly 1 |
| LLM Shortlist Review | — | yes | NVIDIA_NIM_API_KEY not set — LLM review skipped |

### FAIL — `ats_strict` / swe-mid / swe-startup (overall 50)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: #, #, &, #, #, &, #, #, &, # |
| Content Impact (XYZ Bullets) | 100 | yes | — |
| PDF Compile Reliability | 0 | no | pdflatex compilation failed |
| ATS Parse & Text Recovery | 0 | no | No PDF available for text extraction |
| Recruiter Scan / Visual Quality | 85 | no | PDF page count is 0, expected exactly 1 |
| LLM Shortlist Review | — | yes | NVIDIA_NIM_API_KEY not set — LLM review skipped |

### FAIL — `ats_strict` / swe-staff / swe-bigtech (overall 46)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: #, #, &, #, #, &, #, #, &, # |
| Content Impact (XYZ Bullets) | 83 | no | Facilitated RFC process aligning research and infra orgs, bu…: Missing quantifia |
| PDF Compile Reliability | 0 | no | pdflatex compilation failed |
| ATS Parse & Text Recovery | 0 | no | No PDF available for text extraction |
| Recruiter Scan / Visual Quality | 85 | no | PDF page count is 0, expected exactly 1 |
| LLM Shortlist Review | — | yes | NVIDIA_NIM_API_KEY not set — LLM review skipped |

### FAIL — `ats_strict` / swe-staff / swe-startup (overall 46)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: #, #, &, #, #, &, #, #, &, # |
| Content Impact (XYZ Bullets) | 83 | no | Facilitated RFC process aligning research and infra orgs, bu…: Missing quantifia |
| PDF Compile Reliability | 0 | no | pdflatex compilation failed |
| ATS Parse & Text Recovery | 0 | no | No PDF available for text extraction |
| Recruiter Scan / Visual Quality | 85 | no | PDF page count is 0, expected exactly 1 |
| LLM Shortlist Review | — | yes | NVIDIA_NIM_API_KEY not set — LLM review skipped |

### FAIL — `modern_professional` / finance-analyst / finance-analyst (overall 64)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, #, #, #, &, #, #, &, #, #, |
| Content Impact (XYZ Bullets) | 92 | no | Conducted credit risk analysis on 40+ fixed-income instrumen…: Missing method/te |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `modern_professional` / swe-mid / swe-bigtech (overall 66)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, #, #, #, &, #, #, &, #, #, |
| Content Impact (XYZ Bullets) | 100 | yes | — |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `modern_professional` / swe-mid / swe-startup (overall 66)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, #, #, #, &, #, #, &, #, #, |
| Content Impact (XYZ Bullets) | 100 | yes | — |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `modern_professional` / swe-staff / swe-bigtech (overall 61)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, #, #, #, &, #, #, &, #, #, |
| Content Impact (XYZ Bullets) | 83 | no | Facilitated RFC process aligning research and infra orgs, bu…: Missing quantifia |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `modern_professional` / swe-staff / swe-startup (overall 61)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, #, #, #, &, #, #, &, #, #, |
| Content Impact (XYZ Bullets) | 83 | no | Facilitated RFC process aligning research and infra orgs, bu…: Missing quantifia |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `modern_executive` / finance-analyst / finance-analyst (overall 64)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, %, %, #, #, #, &, #, #, &, |
| Content Impact (XYZ Bullets) | 92 | no | Conducted credit risk analysis on 40+ fixed-income instrumen…: Missing method/te |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `modern_executive` / swe-mid / swe-bigtech (overall 66)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, %, %, #, #, #, &, #, #, &, |
| Content Impact (XYZ Bullets) | 100 | yes | — |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `modern_executive` / swe-mid / swe-startup (overall 66)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, %, %, #, #, #, &, #, #, &, |
| Content Impact (XYZ Bullets) | 100 | yes | — |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `modern_executive` / swe-staff / swe-bigtech (overall 61)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, %, %, #, #, #, &, #, #, &, |
| Content Impact (XYZ Bullets) | 83 | no | Facilitated RFC process aligning research and infra orgs, bu…: Missing quantifia |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `modern_executive` / swe-staff / swe-startup (overall 61)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, %, %, #, #, #, &, #, #, &, |
| Content Impact (XYZ Bullets) | 83 | no | Facilitated RFC process aligning research and infra orgs, bu…: Missing quantifia |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `tech_innovator` / finance-analyst / finance-analyst (overall 64)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, #, #, #, &, #, #, &, #, #, |
| Content Impact (XYZ Bullets) | 92 | no | Conducted credit risk analysis on 40+ fixed-income instrumen…: Missing method/te |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `tech_innovator` / swe-mid / swe-bigtech (overall 66)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, #, #, #, &, #, #, &, #, #, |
| Content Impact (XYZ Bullets) | 100 | yes | — |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `tech_innovator` / swe-mid / swe-startup (overall 66)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, #, #, #, &, #, #, &, #, #, |
| Content Impact (XYZ Bullets) | 100 | yes | — |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `tech_innovator` / swe-staff / swe-bigtech (overall 61)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, #, #, #, &, #, #, &, #, #, |
| Content Impact (XYZ Bullets) | 83 | no | Facilitated RFC process aligning research and infra orgs, bu…: Missing quantifia |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |

### FAIL — `tech_innovator` / swe-staff / swe-startup (overall 61)

| Dimension | Score | Pass | Issues |
|-----------|-------|------|--------|
| LaTeX Structural Integrity | 95 | yes | Possible unescaped special characters: %, %, %, %, %, #, #, #, &, #, #, &, #, #, |
| Content Impact (XYZ Bullets) | 83 | no | Facilitated RFC process aligning research and infra orgs, bu…: Missing quantifia |
| PDF Compile Reliability | 100 | yes | — |
| ATS Parse & Text Recovery | 0 | no | pdf-parse failed to extract text |
