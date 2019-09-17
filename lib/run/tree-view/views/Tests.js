module.exports = () => {
   return  `
      <atom-panel id="atombrowser-navbar" class="padded native-key-bindings">
        <table id="table-resume">
          <tr>
            <th>Errors</th>
            <th>Failures</th>
            <th>Skipped</th>
            <th>Tests</th>
          </tr>
          <tr>
            <th id="resume-errors">0</th>
            <th id="resume-failures">0</th>
            <th id="resume-skipped">0</th>
            <th id="resume-tests">0</th>
          </tr>
        </table>

        <table id="table-tests">
          <tr>
            <th>Classname</th>
            <th>Name</th>
            <th>Time</th>
            <th>Test</th>
            <th>Output</th>
            <th>Waveform</th>
          </tr>
        </table>
      </atom-panel>
   `.trim()
}
