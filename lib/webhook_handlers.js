module.exports = {
  incoming: function (params) {
    if (params.payload) {
      params = JSON.parse(params.payload)
    }

    let content = params.text || params.message
    let datetime = formattedDateTime()
    let message = `【${datetime}】${content}`

    return message
  },
  sentry: function (params) {
    let lines = []
    let datetime = formattedDateTime()
    lines.push(`【${datetime}】${params.message}\n`)
    lines.push(`【错误级别】${params.level}`)
    lines.push(`【错误原因】${params.culprit}`)
    if (params.url) {
      lines.push(`【相关链接】${params.url}`)
    }
    if (params.extra && params.extra.url) {
      lines.push(`【错误链接】${params.extra.url}`)
    }

    return lines.join("\n")
  },
  gitlab: function(params) {
    const obj_attr = params.object_attributes || {};
    const assignee = params.assignees[0] || {};
    const last_commit = obj_attr.last_commit || {};
    const author = last_commit.author || {};

    let url = ''
    let title = ''
    let lines = []

    if (params.object_kind == 'push') {
      const commit = params.commits[0]

      url = commit.url
      title = `【Gitlab】${params.user_name} 提交了代码到 ${params.project.namespace}/${params.project.name}`

      lines.push(`【COMMIT ID】${commit.id}`)
      lines.push(`【COMMIT LOG】${commit.message}`)
      lines.push(`【OPERATOR】${params.user_name}`)
    } else if (params.object_kind == 'merge_request') {

      return `MergeRequest提示\n\n` +
        `> MR仓储: ${params.project.name}\n\n` +
        `> 合并信息: ${obj_attr.title}\n\n` +
        `> 合并分支: ${obj_attr.source_branch}\n\n` +
        `> 目标分支: ${obj_attr.target_branch}\n\n` +
        `> 请求人员: ${params.user.name||params.user.username||auth.name}\n\n` +
        `> 合并人员: ${assignee.name || assignee.username}\n\n` +
        `> MR详情: [view merge request](${obj_attr.url})`
    } else {
      url = 'https://gitlab.com'
      title = `【Gitlab】不支持的事件类型：${params.object_kind}`
      lines.push(`如果需要，自己实现一下吧！`)
      console.log(JSON.stringify(params))
    }

    return lines.join("\n")
  },
  github: function(params) {
    let url = ''
    let title = ''
    let lines = []
    const data = JSON.parse(params.payload)

    if (data.compare) {
      const commit = data.commits[0]

      url = data.compare
      title = `【Github】${commit.committer.name} 提交了代码到 ${data.repository.full_name}`
      lines.push(`【COMMIT ID】${commit.id}`)
      lines.push(`【COMMIT LOG】${commit.message}`)
      lines.push(`【OPERATOR】${commit.committer.name}`)
    } else {
      url = 'https://gitlab.com'
      title = `【Github】不支持的事件类型`
      lines.push(`如果需要，自己实现一下吧！`)
      lines.push(JSON.stringify(params))
    }

    return lines.join("\n")
  }
}

function formattedDateTime() {
  let date = new Date()
  let month = date.getMonth() + 1
  let hour = date.getHours()
  let min = date.getMinutes()
  month = month < 10 ? `0${month}` : month
  hour = hour < 10 ? `0${hour}` : hour
  min = min < 10 ? `0${min}` : min
  return `${month}-${date.getDate()} ${hour}:${min}`
}
