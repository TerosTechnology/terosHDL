module.exports = () => {
   return  `
      <atom-panel id="atombrowser-navbar" class="padded native-key-bindings">
        <table id="resume-table">
          <tr id="resume-title">
            <th>Errors</th>
            <th>Failures</th>
            <th>Skipped</th>
            <th>Tests</th>
          </tr>
          <tr id="resume-results">
            <th id="resume-errors">0</th>
            <th id="resume-failures">0</th>
            <th id="resume-skipped">0</th>
            <th id="resume-tests">0</th>
          </tr>
        </table>

        <p></p>
        <p></p>

        <table id="test-table">
          <tr id="test-title">
            <th>Classname</th>
            <th>Name</th>
            <th>Time</th>
            <th>Test</th>
            <th></th>
          </tr>
        </table>
      </atom-panel>
   `.trim()
}
