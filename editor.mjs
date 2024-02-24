import { basicSetup } from "codemirror"
import { EditorView, keymap, scrollPastEnd } from "@codemirror/view"
import { EditorState, Compartment } from "@codemirror/state"
import { HighlightStyle, syntaxHighlighting, foldNodeProp, foldInside, indentNodeProp, LRLanguage, LanguageSupport, delimitedIndent } from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"
import { indentWithTab } from "@codemirror/commands"
import { languages } from "@codemirror/language-data"
import { search, openSearchPanel } from "@codemirror/search"

const languageConf = new Compartment

let theme = EditorView.theme({
    "&": {
        color: "white",
        backgroundColor: "transparent",
        height: "100%"
    },
    ".cm-content": {
        caretColor: "#0e9"
    },
    "&.cm-focused .cm-cursor": {
        borderLeftColor: "#0e9",
    },
    "&.cm-focused": {
        outline: "none"
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "transparent"
    },
    ".cm-activeLine": {
        backgroundColor: "transparent"
    },
    ".cm-gutters": {
        backgroundColor: "transparent",
        color: "#aaaaaa",
        border: "none"
    },
    ".cm-activeLineGutter": {
        backgroundColor: "transparent",
        color: "white"
    }
}, { dark: true })

const customHighlighting = HighlightStyle.define([
    { tag: t.meta, color: "#404740" },
    { tag: t.link, textDecoration: "underline" },
    { tag: t.heading, textDecoration: "underline", fontWeight: "bold" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.keyword, color: "#b0a" },
    { tag: [t.atom, t.bool, t.url, t.contentSeparator, t.labelName], color: "#219" },
    { tag: [t.literal, t.inserted], color: "#164" },
    { tag: [t.string, t.deleted], color: "#c68b72" },
    { tag: [t.regexp, t.escape, t.special(t.string)], color: "#e40" },
    { tag: t.definition(t.variableName), color: "#00f" },
    { tag: t.local(t.variableName), color: "#30a" },
    { tag: [t.typeName, t.namespace], color: "#085" },
    { tag: t.className, color: "#167" },
    { tag: [t.special(t.variableName), t.macroName], color: "#256" },
    { tag: t.definition(t.propertyName), color: "#00c" },
    { tag: t.comment, color: "#1b7a34" },
    { tag: t.invalid, color: "#f00" }
])


let state = EditorState.create({
    extensions: [basicSetup, languageConf.of([]), theme, syntaxHighlighting(customHighlighting), keymap.of([indentWithTab]), scrollPastEnd(), search({ top: true })],
})

let editor = new EditorView({
    state: state,
    parent: document.querySelector("#editor")
})

export { state, editor, languages, languageConf, openSearchPanel }