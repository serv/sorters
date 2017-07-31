export const replaceAll = (string, search, replacement) => {
  if (typeof string === "string") {
    return string.replace(new RegExp(search, 'g'), replacement)
  } else {
    return string
  }
}

export const teaserAndInfo = (content, min, opt, max) => {
	if (content) {
		if (content.length <= max) {
			return {
				cut: false,
				teaser: content
			};
		}
		const words = content.split(" ");
		let teaser = "";
		for (let i=0; i<words.length; i++) {
			const candidate = words[i];
			let wouldbelength = teaser.length + 1 + candidate.length + 3;
			if (wouldbelength >= opt) {
				// We're done
				if (wouldbelength > max) {
					if (teaser.length + 3 < min) {
						// cut the word
						return {
							teaser: teaser + " " + candidate.substring(0, opt - teaser.length - 1) + "...",
							cut: true,
						};
					} else {
						return {
							teaser: teaser + "...",
							cut: true,
						};
					}
				} else {
					return {
						teaser: teaser + " " + candidate + "...",
						cut: true,
					};
				}
			}
			teaser += " " + candidate;
		}
		return {
			teaser: teaser + "...",
			cut: true,
		};
	} else {
		return {
			teaser: "",
			cut: false,
		};
	}
};
export const teaser = (content, min, opt, max) => {
	const teaser = teaserAndInfo(content, min, opt, max);
	return teaser.teaser;
}
