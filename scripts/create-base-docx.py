import zipfile
import os

docx_path = 'assets/base-resume-template.docx'
os.makedirs('assets', exist_ok=True)

# Define the XML files required in the DOCX archive structure
files = {
    '[Content_Types].xml': """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>""",

    '_rels/.rels': """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>""",

    'word/document.xml': """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>{basics.name}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Email: {basics.email} | Phone: {basics.phone}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Branch: {branch} | CGPA: {cgpa}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>--- EDUCATION ---</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>{#education}{institution} - {degree} ({score}) {/education}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>--- EXPERIENCE ---</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>{#experience}{company} - {role} ({duration}) {/experience}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>--- PROJECTS ---</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>{#projects}{name}: {description} {/projects}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>--- SKILLS ---</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>{skills.languages} | {skills.frameworks} | {skills.tools}</w:t></w:r>
    </w:p>
  </w:body>
</w:document>"""
}

with zipfile.ZipFile(docx_path, 'w') as docx:
    for name, content in files.items():
        docx.writestr(name, content)

print("Created base docx template successfully!")
