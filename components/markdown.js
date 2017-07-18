import React from 'react'
const md = require('markdown-it')({
		html: true,
		linkify: true,
		typographer: true
	})
	.use(require('markdown-it-emoji'));

const Markdown = (props) => {
	if (props.content) {
		return <div className="markdown" dangerouslySetInnerHTML={{__html: md.render(props.content)}}></div>
	} else {
		return <div></div>
	}
}
export default Markdown
