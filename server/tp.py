import pymupdf  # import package PyMuPDF


# open input PDF
doc = pymupdf.open("mansi_dwivedi_resume.pdf")


# load desired page (0-based page number)
page = doc[0]


# search for "whale", results in a list of rectangles
rects = page.search_for("Deutsche Bank")


# mark all occurrences in one go
page.add_highlight_annot(rects)


# save the document with these changes
doc.save("output.pdf")
