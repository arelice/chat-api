package util

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	relaymodel "one-api/relay/model"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func ShouldDisableChannel(err *relaymodel.Error, statusCode int) bool {
	if !config.AutomaticDisableChannelEnabled {
		return false
	}
	if err == nil {
		return false
	}
	if statusCode == http.StatusUnauthorized {
		return true
	}
	if statusCode == http.StatusPreconditionRequired {
		return true
	}
	switch err.Type {
	case "insufficient_quota":
		return true
	// https://docs.anthropic.com/claude/reference/errors
	case "authentication_error":
		return true
	case "permission_error":
		return true
	case "forbidden":
		return true
	}
	if err.Code == "invalid_api_key" || err.Code == "account_deactivated" {
		return true
	}
	if strings.HasPrefix(err.Message, "Your credit balance is too low") { // anthropic
		return true
	} else if strings.HasPrefix(err.Message, "This organization has been disabled.") {
		return true
	}
	//if strings.Contains(err.Message, "quota") {
	//	return true
	//}
	if strings.Contains(err.Message, "用户已被封禁") {
		return true
	}
	if strings.Contains(err.Message, "credit") {
		return true
	}
	if strings.Contains(err.Message, "balance") {
		return true
	}
	return false
}

func ShouldEnableChannel(err error, openAIErr *relaymodel.Error) bool {
	if !config.AutomaticEnableChannelEnabled {
		return false
	}
	if err != nil {
		return false
	}
	if openAIErr != nil {
		return false
	}
	return true
}

func GetAPIVersion(c *gin.Context) string {
	query := c.Request.URL.Query()
	apiVersion := query.Get("api-version")
	if apiVersion == "" {
		apiVersion = c.GetString("api_version")
	}
	return apiVersion
}

type GeneralErrorResponse struct {
	Error    relaymodel.Error `json:"error"`
	Message  string           `json:"message"`
	Msg      string           `json:"msg"`
	Err      string           `json:"err"`
	ErrorMsg string           `json:"error_msg"`
	Header   struct {
		Message string `json:"message"`
	} `json:"header"`
	Response struct {
		Error struct {
			Message string `json:"message"`
		} `json:"error"`
	} `json:"response"`
}

func (e GeneralErrorResponse) ToMessage() string {
	if e.Error.Message != "" {
		return e.Error.Message
	}
	if e.Message != "" {
		return e.Message
	}
	if e.Msg != "" {
		return e.Msg
	}
	if e.Err != "" {
		return e.Err
	}
	if e.ErrorMsg != "" {
		return e.ErrorMsg
	}
	if e.Header.Message != "" {
		return e.Header.Message
	}
	if e.Response.Error.Message != "" {
		return e.Response.Error.Message
	}
	return ""
}

func RelayErrorHandler(resp *http.Response) (ErrorWithStatusCode *relaymodel.ErrorWithStatusCode) {
    if resp == nil {
        return &relaymodel.ErrorWithStatusCode{
            StatusCode: 500,
            Error: relaymodel.Error{
                Message: "请稍后再试试，如长时间不可用，请通知管理员q2411728460 进行处理",
                Type:    "model_unavailable",
                Code:    "model_unavailable",
            },
        }
    }

    ErrorWithStatusCode = &relaymodel.ErrorWithStatusCode{
        StatusCode: resp.StatusCode,
        Error: relaymodel.Error{
            Message: "请稍后再试试，如长时间不可用，请通知管理员q2411728460 进行处理",
            Type:    "model_unavailable",
            Code:    "model_unavailable",
        },
    }

    // 读取上游响应体（可选，如果需要记录上游错误信息）
    _, err := io.ReadAll(resp.Body)
    if err != nil {
        // 不记录错误
    }
    err = resp.Body.Close()
    if err != nil {
        // 不记录错误
    }

    return
}


func GetFullRequestURL(baseURL string, requestURL string, channelType int) string {
	fullRequestURL := fmt.Sprintf("%s%s", baseURL, requestURL)

	if strings.HasPrefix(baseURL, "https://gateway.ai.cloudflare.com") {
		switch channelType {
		case common.ChannelTypeOpenAI:
			fullRequestURL = fmt.Sprintf("%s%s", baseURL, strings.TrimPrefix(requestURL, "/v1"))
		case common.ChannelTypeAzure:
			fullRequestURL = fmt.Sprintf("%s%s", baseURL, strings.TrimPrefix(requestURL, "/openai/deployments"))
		}
	}
	return fullRequestURL
}

func GetAzureAPIVersion(c *gin.Context) string {
	query := c.Request.URL.Query()
	apiVersion := query.Get("api-version")
	if apiVersion == "" {
		apiVersion = c.GetString(common.ConfigKeyAPIVersion)
	}
	return apiVersion
}

func ResetStatusCode(openaiErr *relaymodel.ErrorWithStatusCode, statusCodeMappingStr string) {
	if statusCodeMappingStr == "" || statusCodeMappingStr == "{}" {
		return
	}
	statusCodeMapping := make(map[string]string)
	err := json.Unmarshal([]byte(statusCodeMappingStr), &statusCodeMapping)
	if err != nil {
		return
	}
	if openaiErr.StatusCode == http.StatusOK {
		return
	}

	codeStr := strconv.Itoa(openaiErr.StatusCode)
	if _, ok := statusCodeMapping[codeStr]; ok {
		intCode, _ := strconv.Atoi(statusCodeMapping[codeStr])
		openaiErr.StatusCode = intCode
	}
}
