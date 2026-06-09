/**
 * Rule-based static code analysis.
 * No AI or external APIs — pure pattern matching and heuristics.
 */

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface CodeAnalysis {
  /** Human-readable purpose / role of the file. */
  purpose: string;
  /** Human-readable language name. */
  language: string;
  /** Number of detected function/method definitions. */
  totalFunctions: number;
  /** Number of detected class/struct/interface definitions. */
  totalClasses: number;
  /** Total line count (all lines, including blank). */
  totalLines: number;
}

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────

/**
 * Runs rule-based analysis on source code and returns a structured summary.
 *
 * @param code       - Raw source text.
 * @param languageId - VS Code language identifier (e.g. "typescript").
 * @param fileName   - Bare file name (e.g. "app.ts").
 */
export function analyzeCode(
  code: string,
  languageId: string,
  fileName: string
): CodeAnalysis {
  return {
    purpose:        detectPurpose(code, languageId, fileName),
    language:       getDisplayLanguage(languageId),
    totalFunctions: countFunctions(code, languageId),
    totalClasses:   countClasses(code, languageId),
    totalLines:     code.split('\n').length,
  };
}

// ────────────────────────────────────────────────────────────
// Purpose detection
// ────────────────────────────────────────────────────────────

function detectPurpose(code: string, languageId: string, fileName: string): string {
  const src  = code.toLowerCase();
  const file = fileName.toLowerCase();

  // ── Config / data files ──────────────────────────────────
  if (file === 'package.json')                          { return 'Node.js Package Configuration'; }
  if (file.startsWith('tsconfig'))                      { return 'TypeScript Configuration'; }
  if (file === '.eslintrc' || file.startsWith('.eslint')) { return 'ESLint Configuration'; }
  if (file === '.prettierrc' || file.startsWith('.prettier')) { return 'Prettier Configuration'; }
  if (file.startsWith('.env'))                          { return 'Environment Variables'; }
  if (file === 'dockerfile' || file.startsWith('dockerfile')) { return 'Docker Container Definition'; }
  if (file === 'docker-compose.yml' || file === 'docker-compose.yaml') { return 'Docker Compose Configuration'; }
  if (languageId === 'json' || file.endsWith('.json'))  { return 'JSON Configuration / Data'; }
  if (languageId === 'yaml' || languageId === 'yml')    { return 'YAML Configuration'; }
  if (languageId === 'xml')                             { return 'XML Document'; }
  if (languageId === 'markdown')                        { return 'Documentation (Markdown)'; }
  if (languageId === 'css' || languageId === 'scss' || languageId === 'less') { return 'Stylesheet'; }
  if (languageId === 'html')                            { return 'HTML Document'; }
  if (languageId === 'sql')                             { return 'SQL Query / Schema'; }
  if (languageId === 'shellscript' || languageId === 'bash') { return 'Shell / Bash Script'; }

  // ── Framework & library detection ─────────────────────────
  if (_has(src, 'import vscode', "require('vscode')", 'require("vscode")')) { return 'VS Code Extension'; }

  if (_has(src, 'import react', "require('react')", 'require("react")', 'from "react"', "from 'react'")) {
    if (_has(src, 'usestate', 'useeffect', 'usecallback', 'useref', 'usecontext')) { return 'React Functional Component'; }
    if (_has(src, 'component', 'render('))  { return 'React Class Component'; }
    return 'React Module';
  }

  if (_has(src, 'import express', "require('express')", 'require("express")')) { return 'Express.js Web Server'; }
  if (_has(src, 'import { nestfactory', '@nestjs/', '@module(', '@controller(', '@injectable(')) { return 'NestJS Application'; }
  if (_has(src, 'import vue', "require('vue')", '<template>', 'definecomponent')) { return 'Vue.js Component'; }
  if (_has(src, '@angular/', 'ngmodule', 'component({', 'injectable({')) { return 'Angular Module'; }
  if (_has(src, 'import flask', 'from flask', '@app.route', 'flask(__name__)')) { return 'Flask Web Application'; }
  if (_has(src, 'import django', 'from django', 'urlpatterns')) { return 'Django Application'; }
  if (_has(src, 'import fastapi', 'from fastapi', '@app.get(', '@router.post(')) { return 'FastAPI Application'; }
  if (_has(src, 'mongoose', 'schema({', 'model('))       { return 'Mongoose / MongoDB Model'; }
  if (_has(src, 'sequelize', 'datatypes.', 'model.init(')) { return 'Sequelize ORM Model'; }
  if (_has(src, 'prisma', 'prisma.', '@prisma/client'))  { return 'Prisma ORM Module'; }
  if (_has(src, 'graphql', 'typedef', 'gql`'))           { return 'GraphQL Schema / Resolver'; }

  // ── Test files ────────────────────────────────────────────
  if (
    file.includes('.test.') || file.includes('.spec.') || file.endsWith('.test') ||
    _has(src, "describe('", 'describe("', 'describe(`', 'it(\'', 'it("', 'it(`',
              "test('", 'test("', 'test(`', '@test', 'assertequals', 'assert_equal',
              'expect(', 'jest.', 'mocha', 'chai', 'sinon')
  ) {
    return 'Test Suite';
  }

  // ── API / routing ─────────────────────────────────────────
  if (_has(src, 'router.get(', 'router.post(', 'router.put(', 'router.delete(',
                'app.get(', 'app.post(', 'app.put(', 'app.delete(')) {
    return 'API Route Handler';
  }

  // ── Middleware ────────────────────────────────────────────
  if (_has(src, 'req, res, next', 'req,res,next', 'middleware'))  { return 'Middleware Module'; }

  // ── Auth ──────────────────────────────────────────────────
  if (_has(src, 'jwt', 'jsonwebtoken', 'passport', 'bcrypt', 'oauth')) { return 'Authentication / Security Module'; }

  // ── Type definitions (TS) ─────────────────────────────────
  if ((languageId === 'typescript' || languageId === 'typescriptreact')) {
    const typeCount = (src.match(/^\s*(export\s+)?(interface|type)\s+/gm) ?? []).length;
    if (typeCount >= 3) { return 'TypeScript Type Definitions'; }
  }

  // ── OOP / utility fallback ────────────────────────────────
  const classes = countClasses(code, languageId);
  if (classes > 0)                                       { return 'Object-Oriented Module'; }

  const fns = countFunctions(code, languageId);
  if (fns > 0)                                           { return 'Utility / Helper Functions'; }

  return 'General Code Module';
}

// ────────────────────────────────────────────────────────────
// Function counting
// ────────────────────────────────────────────────────────────

function countFunctions(code: string, languageId: string): number {
  // Strip single-line comments to reduce false positives
  const clean = code
    .replace(/\/\/.*$/gm, '')   // JS/TS line comments
    .replace(/#.*$/gm, '');     // Python / Shell line comments

  let count = 0;

  switch (languageId) {

    case 'python':
      count += _count(clean, /^\s*(?:async\s+)?def\s+[\w$]+\s*\(/gm);
      break;

    case 'ruby':
      count += _count(clean, /^\s*def\s+[\w$?!]+/gm);
      break;

    case 'go':
      count += _count(clean, /^func\s+(?:\(\s*\w+\s+\*?[\w.]+\s*\)\s+)?[\w$]+\s*\(/gm);
      break;

    case 'rust':
      count += _count(clean, /\bfn\s+[\w$]+\s*(?:<[^>]*>)?\s*\(/gm);
      break;

    case 'kotlin':
      count += _count(clean, /\bfun\s+[\w$]+\s*\(/gm);
      break;

    case 'swift':
      count += _count(clean, /\bfunc\s+[\w$]+\s*\(/gm);
      break;

    case 'php':
      count += _count(clean, /\bfunction\s+[\w$]+\s*\(/gm);
      break;

    case 'java':
    case 'csharp': {
      // Matches: [modifier] [returnType] methodName( ...
      const javaMethodRe =
        /\b(?:public|private|protected|static|void|int|long|double|float|boolean|string|char|byte|short|object)\b[\w\s<>[\],?]*[\w$]+\s*\([^)]*\)\s*(?:throws\s+[\w,\s]+)?\s*\{/gim;
      count += _count(clean, javaMethodRe);
      break;
    }

    default: {
      // JavaScript / TypeScript (and JSX/TSX)
      // 1. Named function declarations: function foo(
      count += _count(clean, /\bfunction\s*\*?\s+[\w$]+\s*\(/gm);
      // 2. Anonymous / generator: function(  |  function*(
      count += _count(clean, /\bfunction\s*\*?\s*\(/gm);
      // 3. Arrow assigned to variable: const foo = (...) =>  |  const foo = async (...) =>
      count += _count(clean, /\b(?:const|let|var)\s+[\w$]+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/gm);
      // 4. Single-param arrow: const foo = x =>
      count += _count(clean, /\b(?:const|let|var)\s+[\w$]+\s*=\s*(?:async\s*)?[\w$]+\s*=>/gm);
      // 5. Function expression: const foo = function
      count += _count(clean, /\b(?:const|let|var)\s+[\w$]+\s*=\s*(?:async\s*)?function\b/gm);
      break;
    }
  }

  return count;
}

// ────────────────────────────────────────────────────────────
// Class counting
// ────────────────────────────────────────────────────────────

function countClasses(code: string, languageId: string): number {
  switch (languageId) {
    case 'python':
      return _count(code, /^\s*class\s+[\w$]+/gm);
    case 'go':
      return _count(code, /^type\s+[\w$]+\s+struct\b/gm);
    case 'rust':
      return _count(code, /\b(?:struct|impl|trait)\s+[\w$]+/gm);
    case 'kotlin':
    case 'swift':
      return _count(code, /\b(?:class|struct|protocol|interface)\s+[\w$]+/gm);
    default:
      // JS, TS, Java, C#, PHP, Ruby, etc.
      return _count(code, /\bclass\s+[\w$]+/gm);
  }
}

// ────────────────────────────────────────────────────────────
// Language display names
// ────────────────────────────────────────────────────────────

function getDisplayLanguage(languageId: string): string {
  const MAP: Record<string, string> = {
    javascript:       'JavaScript',
    typescript:       'TypeScript',
    javascriptreact:  'React (JSX)',
    typescriptreact:  'React (TSX)',
    python:           'Python',
    java:             'Java',
    csharp:           'C#',
    cpp:              'C++',
    c:                'C',
    go:               'Go',
    rust:             'Rust',
    ruby:             'Ruby',
    php:              'PHP',
    swift:            'Swift',
    kotlin:           'Kotlin',
    html:             'HTML',
    css:              'CSS',
    scss:             'SCSS',
    less:             'LESS',
    json:             'JSON',
    yaml:             'YAML',
    yml:              'YAML',
    markdown:         'Markdown',
    shellscript:      'Shell Script',
    bash:             'Bash',
    sql:              'SQL',
    xml:              'XML',
    dockerfile:       'Dockerfile',
    graphql:          'GraphQL',
    dart:             'Dart',
    r:                'R',
    lua:              'Lua',
    perl:             'Perl',
    scala:            'Scala',
    haskell:          'Haskell',
    elixir:           'Elixir',
    clojure:          'Clojure',
  };
  return MAP[languageId] ?? languageId;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

/** Returns the match count for a regex against a string. */
function _count(text: string, re: RegExp): number {
  return (text.match(re) ?? []).length;
}

/** Returns true if `src` contains any of the provided substrings. */
function _has(src: string, ...terms: string[]): boolean {
  return terms.some(t => src.includes(t));
}
