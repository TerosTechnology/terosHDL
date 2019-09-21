module.exports = () => {
   return  `
      <atom-panel id="atombrowser-navbar" class="padded native-key-bindings">

        <div id="show-none" style="display:block">
        </div>

        <div align="center" id="show-loading" style="display:none">
          <span class='loading loading-spinner-large inline-block'></span>
        </div>

        <div id="show-tests" style="display:none">
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
        </div>



      </atom-panel>
   `.trim()
}
