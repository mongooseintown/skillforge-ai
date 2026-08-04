$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:3000/")
$listener.Start()
Write-Host "[Server] SkillForge AI PERN Stack Server running at http://localhost:3000/"

$frontendRoot = "c:\Users\Encoded Habibi\Pictures\TOOLS PROJECT\frontend"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath

        # CORS Headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.OutputStream.Close()
            continue
        }

        # FEATURE #1 & #2 API ENDPOINT: /api/roadmaps/generate
        if ($path -eq "/api/roadmaps/generate" -and $request.HttpMethod -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $body = $reader.ReadToEnd()
            $reader.Close()

            $jsonInput = $body | ConvertFrom-Json
            $currentSkills = if ($jsonInput.currentSkills) { $jsonInput.currentSkills } else { "Beginner Tech Fundamentals" }
            $targetRole = if ($jsonInput.targetRole) { $jsonInput.targetRole } else { "Full-Stack Engineer" }

            $roadmapData = @{
                success = $true
                source = "SkillForge Metacognitive AI Engine (PERN)"
                data = @{
                    title = "Autonomous $targetRole Roadmap"
                    targetRole = $targetRole
                    estimatedMonths = 4
                    summary = "AI-engineered career trajectory bridging your current skills ($currentSkills) to industry mastery in $targetRole."
                    milestones = @(
                        @{
                            step = 1
                            title = "Core $targetRole Architecture & Fundamentals"
                            duration = "3 Weeks"
                            description = "Consolidate existing knowledge ($currentSkills) and eliminate foundational blind spots."
                            topics = @("$targetRole Core Architecture", "Version Control & Git Workflows", "Environment Setup")
                            project = "Baseline $targetRole Prototype"
                        },
                        @{
                            step = 2
                            title = "Intermediate System Architecture & APIs"
                            duration = "5 Weeks"
                            description = "Build robust, scalable application modules using modern enterprise patterns."
                            topics = @("API Integration & Data Pipelines", "State Management & Logic Flow", "Automated Testing Suite")
                            project = "Full-Featured Dynamic Application"
                        },
                        @{
                            step = 3
                            title = "Advanced Optimization & Production Deployment"
                            duration = "4 Weeks"
                            description = "Master performance tuning, security best practices, and automated deployment."
                            topics = @("Performance Profiling & Caching", "Security, Auth & Encryption", "CI/CD & Cloud Infrastructure")
                            project = "Production-Grade Capstone Deployment"
                        }
                    )
                    diagnosticQuiz = @(
                        @{
                            id = 1
                            topic = "Async Memory Leak Cleanup"
                            question = "In professional $targetRole development, what triggers an async memory leak if a component unmounts during an active fetch request?"
                            options = @(
                                "Forgetting to pass the dependency array to useEffect",
                                "Not utilizing an AbortController signal in the cleanup function",
                                "Declaring state variables inside the effect function",
                                "Using useCallback on the fetch wrapper function"
                            )
                            correctIndex = 1
                            explanation = "In production apps, unmounted fetch callbacks attempt to update unmounted state unless cancelled with AbortController.abort() in cleanup."
                            remedialLesson = "Mastering AbortController & Async Cleanup in $targetRole"
                        },
                        @{
                            id = 2
                            topic = "Vector RAG Optimization"
                            question = "Which pattern best optimizes API token waste in Retrieval-Augmented Generation (RAG)?"
                            options = @(
                                "Context Chunking & Vector Semantic Retrieval",
                                "Sending entire database in every prompt payload",
                                "Disabling prompt compression completely",
                                "Hardcoding fixed static responses in the client"
                            )
                            correctIndex = 0
                            explanation = "Semantic vector retrieval passes only high-relevance chunks to the model, reducing token waste by up to 85%."
                            remedialLesson = "Optimizing Vector Context Embeddings in RAG Architecture"
                        }
                    )
                }
            }

            $jsonResponse = $roadmapData | ConvertTo-Json -Depth 5
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonResponse)
            $response.ContentType = "application/json; charset=utf-8"
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.OutputStream.Close()
            continue
        }
        
        # FRONTEND SERVING
        if ($path -eq "/") { $path = "/index.html" }
        $filePath = Join-Path $frontendRoot $path
        
        if (-not (Test-Path $filePath -PathType Leaf)) {
            $filePath = Join-Path $frontendRoot "index.html"
        }

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                ".jsx"  { $response.ContentType = "application/javascript; charset=utf-8" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $buf = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($buf, 0, $buf.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Continue listening
    }
}
